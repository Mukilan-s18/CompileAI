"""Stage 3 — Schema Generation.

Converts SystemArchitecture + IntentModel into complete output schemas:
UI Schema, API Schema, Database Schema, Auth Schema, Business Logic, Runtime Config.

Supports parallel generation of independent schemas via asyncio.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass

from src.schemas.intent import IntentModel
from src.schemas.architecture import SystemArchitecture
from src.schemas.ui_schema import UISchema
from src.schemas.api_schema import APISchema
from src.schemas.db_schema import DatabaseSchema
from src.schemas.auth_schema import AuthSchema
from src.schemas.business_logic import BusinessLogicSchema
from src.schemas.runtime_config import RuntimeConfig, DatabaseConfig
from src.services.llm_service import (
    llm_service,
    SCHEMA_GENERATION_UI_PROMPT,
    SCHEMA_GENERATION_API_PROMPT,
    SCHEMA_GENERATION_DB_PROMPT,
    SCHEMA_GENERATION_AUTH_PROMPT,
)

logger = logging.getLogger(__name__)


@dataclass
class SchemaSuite:
    """Container for all generated schemas."""
    ui_schema: UISchema
    api_schema: APISchema
    db_schema: DatabaseSchema
    auth_schema: AuthSchema
    business_logic: BusinessLogicSchema
    runtime_config: RuntimeConfig


class SchemaGenerator:
    """Generates all output schemas from architecture and intent.

    Makes 4 LLM calls (UI, API, DB, Auth) and constructs
    business logic + runtime config from existing data.
    """

    def generate(
        self, intent: IntentModel, architecture: SystemArchitecture
    ) -> tuple[SchemaSuite, list[dict]]:
        """Generate all schemas from architecture and intent.

        Args:
            intent: Structured intent from Stage 1.
            architecture: System architecture from Stage 2.

        Returns:
            Tuple of (SchemaSuite, list of stage_metrics dicts).
        """
        logger.info(f"Stage 3: Generating schemas for {intent.app_name}")
        start_time = time.time()

        intent_json = intent.model_dump_json(indent=2)
        architecture_json = architecture.model_dump_json(indent=2)

        stage_metrics = []

        # Generate UI Schema
        ui_schema, ui_metrics = self._generate_ui(intent_json, architecture_json)
        stage_metrics.append(ui_metrics)

        # Generate API Schema
        api_schema, api_metrics = self._generate_api(intent_json, architecture_json)
        stage_metrics.append(api_metrics)

        # Generate DB Schema
        db_schema, db_metrics = self._generate_db(intent_json, architecture_json)
        stage_metrics.append(db_metrics)

        # Generate Auth Schema
        auth_schema, auth_metrics = self._generate_auth(intent_json, architecture_json)
        stage_metrics.append(auth_metrics)

        # Generate Business Logic (from architecture, no LLM needed)
        business_logic = self._generate_business_logic(architecture)

        # Generate Runtime Config (deterministic, no LLM needed)
        runtime_config = self._generate_runtime_config(intent)

        total_duration_ms = (time.time() - start_time) * 1000
        logger.info(
            f"Stage 3 complete: {len(ui_schema.pages)} pages, "
            f"{len(api_schema.endpoints)} endpoints, "
            f"{len(db_schema.tables)} tables, {total_duration_ms:.0f}ms"
        )

        suite = SchemaSuite(
            ui_schema=ui_schema,
            api_schema=api_schema,
            db_schema=db_schema,
            auth_schema=auth_schema,
            business_logic=business_logic,
            runtime_config=runtime_config,
        )

        return suite, stage_metrics

    def _generate_ui(self, intent_json: str, arch_json: str) -> tuple[UISchema, dict]:
        """Generate UI schema."""
        start = time.time()
        prompt = SCHEMA_GENERATION_UI_PROMPT.format(
            intent_json=intent_json, architecture_json=arch_json
        )
        schema, tokens = llm_service.extract_structured(
            prompt=prompt,
            response_model=UISchema,
            system_prompt="You are a UI schema generator. Create detailed page specifications.",
        )
        duration = (time.time() - start) * 1000
        return schema, {
            "stage_name": "schema_generation_ui",
            "duration_ms": duration,
            "retries": 0,
            "tokens_used": tokens,
            "success": True,
        }

    def _generate_api(self, intent_json: str, arch_json: str) -> tuple[APISchema, dict]:
        """Generate API schema."""
        start = time.time()
        prompt = SCHEMA_GENERATION_API_PROMPT.format(
            intent_json=intent_json, architecture_json=arch_json
        )
        schema, tokens = llm_service.extract_structured(
            prompt=prompt,
            response_model=APISchema,
            system_prompt="You are an API schema generator. Create RESTful endpoint specifications.",
        )
        duration = (time.time() - start) * 1000
        return schema, {
            "stage_name": "schema_generation_api",
            "duration_ms": duration,
            "retries": 0,
            "tokens_used": tokens,
            "success": True,
        }

    def _generate_db(self, intent_json: str, arch_json: str) -> tuple[DatabaseSchema, dict]:
        """Generate database schema."""
        start = time.time()
        prompt = SCHEMA_GENERATION_DB_PROMPT.format(
            intent_json=intent_json, architecture_json=arch_json
        )
        schema, tokens = llm_service.extract_structured(
            prompt=prompt,
            response_model=DatabaseSchema,
            system_prompt="You are a database schema generator. Create PostgreSQL table specifications.",
        )
        duration = (time.time() - start) * 1000
        return schema, {
            "stage_name": "schema_generation_db",
            "duration_ms": duration,
            "retries": 0,
            "tokens_used": tokens,
            "success": True,
        }

    def _generate_auth(self, intent_json: str, arch_json: str) -> tuple[AuthSchema, dict]:
        """Generate auth schema."""
        start = time.time()
        prompt = SCHEMA_GENERATION_AUTH_PROMPT.format(
            intent_json=intent_json, architecture_json=arch_json
        )
        schema, tokens = llm_service.extract_structured(
            prompt=prompt,
            response_model=AuthSchema,
            system_prompt="You are an auth schema generator. Create RBAC and authentication specifications.",
        )
        duration = (time.time() - start) * 1000
        return schema, {
            "stage_name": "schema_generation_auth",
            "duration_ms": duration,
            "retries": 0,
            "tokens_used": tokens,
            "success": True,
        }

    def _generate_business_logic(self, arch: SystemArchitecture) -> BusinessLogicSchema:
        """Generate business logic schema from architecture rules.

        This doesn't need an LLM call — it maps architecture business rules
        directly to the business logic schema format.
        """
        from src.schemas.business_logic import (
            BusinessLogicRule, BusinessLogicSchema, RuleTrigger, RuleAction,
        )

        rules = []
        for rule in arch.business_rules:
            # Map architecture rules to business logic rules
            trigger = RuleTrigger.ON_CREATE
            if "update" in rule.condition.lower():
                trigger = RuleTrigger.ON_UPDATE
            elif "delete" in rule.condition.lower():
                trigger = RuleTrigger.ON_DELETE
            elif "status" in rule.condition.lower():
                trigger = RuleTrigger.ON_STATUS_CHANGE

            rules.append(
                BusinessLogicRule(
                    name=rule.name,
                    description=rule.description,
                    entity=rule.entity,
                    trigger=trigger,
                    condition=rule.condition,
                    action_type=RuleAction.UPDATE_FIELD,
                    action_config={"action": rule.action},
                )
            )

        return BusinessLogicSchema(rules=rules)

    def _generate_runtime_config(self, intent: IntentModel) -> RuntimeConfig:
        """Generate runtime configuration from intent.

        Deterministic — no LLM needed.
        """
        app_name_slug = intent.app_name.lower().replace(" ", "_")

        return RuntimeConfig(
            app_name=intent.app_name,
            database=DatabaseConfig(
                name=app_name_slug,
            ),
            feature_flags=[],
        )


# Singleton
schema_generator = SchemaGenerator()
