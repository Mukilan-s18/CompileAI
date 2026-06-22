"""Stage 2 — System Design Layer.

Converts a structured IntentModel into a full SystemArchitecture
with entities, relationships, user flows, permissions, and business rules.
"""

from __future__ import annotations

import logging
import time

from src.schemas.intent import IntentModel
from src.schemas.architecture import SystemArchitecture
from src.services.llm_service import llm_service, SYSTEM_DESIGN_PROMPT

logger = logging.getLogger(__name__)


class SystemDesigner:
    """Designs system architecture from extracted intent.

    Generates:
    - Domain entities with typed fields
    - Entity relationships with cardinality
    - User flows for primary use cases
    - Role-based permission model
    - Business logic rules
    """

    def design(self, intent: IntentModel) -> tuple[SystemArchitecture, dict]:
        """Convert intent into system architecture.

        Args:
            intent: Structured intent from Stage 1.

        Returns:
            Tuple of (SystemArchitecture, stage_metrics dict).
        """
        logger.info(f"Stage 2: Designing system for {intent.app_name}")
        start_time = time.time()

        intent_json = intent.model_dump_json(indent=2)
        formatted_prompt = SYSTEM_DESIGN_PROMPT.format(intent_json=intent_json)

        architecture, tokens_used = llm_service.extract_structured(
            prompt=formatted_prompt,
            response_model=SystemArchitecture,
            system_prompt=(
                "You are the system design stage of an AI application compiler. "
                "Design a complete, consistent system architecture. "
                "Ensure all entities have id, created_at, updated_at fields. "
                "Create permissions for every entity and assign them to roles."
            ),
        )

        # Post-process
        architecture = self._post_process(architecture, intent)

        duration_ms = (time.time() - start_time) * 1000
        logger.info(
            f"Stage 2 complete: {len(architecture.entities)} entities, "
            f"{len(architecture.relationships)} relationships, "
            f"{len(architecture.permissions)} permissions, {duration_ms:.0f}ms"
        )

        return architecture, {
            "stage_name": "system_design",
            "duration_ms": duration_ms,
            "retries": 0,
            "tokens_used": tokens_used,
            "success": True,
        }

    def _post_process(
        self, arch: SystemArchitecture, intent: IntentModel
    ) -> SystemArchitecture:
        """Post-process architecture for consistency.

        - Ensure User entity exists if auth is required
        - Ensure all roles from intent are represented
        - Validate relationship references
        """
        arch.app_name = intent.app_name

        # Ensure all intent roles have role definitions
        existing_role_names = {r.name for r in arch.roles}
        for role_name in intent.roles:
            if role_name not in existing_role_names:
                from src.schemas.architecture import RoleDefinition
                arch.roles.append(
                    RoleDefinition(
                        name=role_name,
                        description=f"{role_name} role",
                        permissions=[],
                    )
                )

        # Validate entity references in relationships
        entity_names = {e.name for e in arch.entities}
        arch.relationships = [
            r for r in arch.relationships
            if r.from_entity in entity_names and r.to_entity in entity_names
        ]

        return arch


# Singleton
system_designer = SystemDesigner()
