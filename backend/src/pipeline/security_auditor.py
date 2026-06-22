"""Security & Threat Modeling Engine.

Stage 4.5: Analyzes generated schemas for security vulnerabilities,
over-permissive access, and missing authentication guards.
"""

from __future__ import annotations

import logging
from typing import Optional

from src.schemas.compilation import CompilationResult
from src.schemas.api_schema import APIEndpoint, HTTPMethod
from src.schemas.db_schema import DBTable
from src.schemas.security import SecurityVulnerability, SecurityAuditResult

logger = logging.getLogger(__name__)


class SecurityAuditor:
    """Scans for security flaws in the generated system design."""

    SENSITIVE_TABLES = {"user", "users", "payment", "payments", "transaction", "credential", "password", "audit"}

    def audit(self, compilation: CompilationResult) -> SecurityAuditResult:
        """Run all security checks against the compilation schemas."""
        logger.info(f"Running Security Audit for compilation {compilation.id}")
        
        result = SecurityAuditResult(passed=True)
        
        if not compilation.api_schema or not compilation.db_schema:
            logger.warning("Skipping security audit: missing API or DB schemas.")
            return result

        self._check_unauthenticated_destructive_endpoints(compilation, result)
        self._check_sensitive_data_exposure(compilation, result)
        self._check_missing_rate_limits(compilation, result)

        if result.has_critical:
            result.passed = False
            logger.error(f"Security audit failed: {len([v for v in result.vulnerabilities if v.severity == 'critical'])} critical vulnerabilities found.")
        else:
            logger.info("Security audit passed.")

        return result

    def _check_unauthenticated_destructive_endpoints(
        self, comp: CompilationResult, result: SecurityAuditResult
    ) -> None:
        """Flag POST, PUT, DELETE endpoints without auth guards."""
        result.checks_performed.append("unauthenticated_destructive_endpoints")
        
        destructive_methods = {HTTPMethod.POST, HTTPMethod.PUT, HTTPMethod.DELETE, HTTPMethod.PATCH}
        
        for idx, endpoint in enumerate(comp.api_schema.endpoints):
            if endpoint.method in destructive_methods and not endpoint.auth_required:
                # Login/Signup endpoints are exceptions
                path_lower = endpoint.path.lower()
                if any(x in path_lower for x in ["login", "signin", "signup", "register", "webhook"]):
                    continue
                    
                vuln = SecurityVulnerability(
                    id=f"SEC-AUTH-001-{idx}",
                    severity="critical",
                    category="Authentication",
                    location=f"API.{endpoint.method.value}.{endpoint.path}",
                    description=f"Destructive endpoint ({endpoint.method.value}) does not require authentication.",
                    remediation="Set `auth_required=True` and assign appropriate roles."
                )
                result.vulnerabilities.append(vuln)

    def _check_sensitive_data_exposure(
        self, comp: CompilationResult, result: SecurityAuditResult
    ) -> None:
        """Ensure sensitive tables are not directly exposed without strict roles."""
        result.checks_performed.append("sensitive_data_exposure")
        
        # Find endpoints returning sensitive tables
        sensitive_tables_present = [
            t.name for t in comp.db_schema.tables 
            if any(s in t.name.lower() for s in self.SENSITIVE_TABLES)
        ]
        
        for idx, endpoint in enumerate(comp.api_schema.endpoints):
            if endpoint.method == HTTPMethod.GET:
                # Check if response payload contains sensitive table names
                path_lower = endpoint.path.lower()
                if any(s in path_lower for s in sensitive_tables_present):
                    if not endpoint.auth_required or (endpoint.allowed_roles and "admin" not in [r.lower() for r in endpoint.allowed_roles]):
                        vuln = SecurityVulnerability(
                            id=f"SEC-EXP-002-{idx}",
                            severity="high",
                            category="Data Exposure",
                            location=f"API.{endpoint.method.value}.{endpoint.path}",
                            description=f"Endpoint exposing potentially sensitive data ({endpoint.path}) lacks strict role-based access control.",
                            remediation="Ensure this endpoint is restricted to 'admin' or owner roles."
                        )
                        result.vulnerabilities.append(vuln)

    def _check_missing_rate_limits(
        self, comp: CompilationResult, result: SecurityAuditResult
    ) -> None:
        """Check if rate limiting is enabled globally or on auth endpoints."""
        result.checks_performed.append("missing_rate_limits")
        
        # Runtime config usually handles this
        if comp.runtime_config and comp.runtime_config.features:
            features = [f.lower() for f in comp.runtime_config.features]
            if not any("rate limit" in f or "throttle" in f for f in features):
                vuln = SecurityVulnerability(
                    id="SEC-DDOS-003",
                    severity="medium",
                    category="Denial of Service",
                    location="RuntimeConfig.features",
                    description="No rate limiting feature specified in runtime configuration.",
                    remediation="Add rate limiting to runtime features to protect against abuse."
                )
                result.vulnerabilities.append(vuln)


# Singleton
security_auditor = SecurityAuditor()
