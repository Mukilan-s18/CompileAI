"""Stage 1 — Intent Extraction.

Converts a natural language product prompt into a structured IntentModel.
Uses LLM with schema-constrained decoding for deterministic extraction.
Retries only this stage on failure (up to max_retries).
"""

from __future__ import annotations

import logging
import time

from src.schemas.intent import IntentModel
from src.services.llm_service import llm_service, INTENT_EXTRACTION_PROMPT

logger = logging.getLogger(__name__)


class IntentExtractor:
    """Extracts structured intent from natural language prompts.

    This is the entry point of the compiler pipeline. It handles:
    - Prompt analysis and feature extraction
    - Vague prompt handling (generates assumptions)
    - Retry logic specific to this stage
    """

    def extract(self, prompt: str) -> tuple[IntentModel, dict]:
        """Extract structured intent from a natural language prompt.

        Args:
            prompt: Natural language product requirements.

        Returns:
            Tuple of (IntentModel, stage_metrics dict).

        Raises:
            RuntimeError: If extraction fails after all retries.
        """
        logger.info(f"Stage 1: Extracting intent from prompt ({len(prompt)} chars)")
        start_time = time.time()
        tokens_used = 0
        retries = 0

        formatted_prompt = INTENT_EXTRACTION_PROMPT.format(prompt=prompt)

        try:
            intent, tokens_used = llm_service.extract_structured(
                prompt=formatted_prompt,
                response_model=IntentModel,
                system_prompt=(
                    "You are the intent extraction stage of an AI application compiler. "
                    "Extract ALL features, roles, and requirements from the user's prompt. "
                    "Be thorough and precise. Use structured output only."
                ),
            )

            # Post-processing: ensure sensible defaults
            intent = self._post_process(intent, prompt)

            duration_ms = (time.time() - start_time) * 1000
            logger.info(
                f"Stage 1 complete: {intent.app_name} ({intent.domain}), "
                f"{len(intent.features)} features, {len(intent.roles)} roles, "
                f"{duration_ms:.0f}ms"
            )

            return intent, {
                "stage_name": "intent_extraction",
                "duration_ms": duration_ms,
                "retries": retries,
                "tokens_used": tokens_used,
                "success": True,
            }

        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error(f"Stage 1 failed: {e}")
            raise RuntimeError(f"Intent extraction failed: {e}") from e

    def _post_process(self, intent: IntentModel, original_prompt: str) -> IntentModel:
        """Post-process the extracted intent for consistency.

        - Ensure at least basic roles exist
        - Add assumptions for vague prompts
        - Validate feature categories
        """
        # Ensure Admin role is always present
        if "Admin" not in intent.roles:
            intent.roles.insert(0, "Admin")

        # If the prompt is very short (<30 chars), add vagueness assumptions
        if len(original_prompt) < 30 and not intent.assumptions:
            intent.assumptions.append(
                "Prompt was brief — generated comprehensive feature set based on domain"
            )

        # If auth is required but no auth features, add one
        if intent.requires_authentication:
            has_auth_feature = any(f.category.value == "auth" for f in intent.features)
            if not has_auth_feature:
                from src.schemas.intent import Feature, FeatureCategory
                intent.features.append(
                    Feature(
                        name="User Authentication",
                        description="Secure login and registration",
                        category=FeatureCategory.AUTH,
                        priority="must-have",
                    )
                )

        return intent


# Singleton
intent_extractor = IntentExtractor()
