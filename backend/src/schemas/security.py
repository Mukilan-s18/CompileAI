"""Security schema models.

Stage 4.5 output: Detected security vulnerabilities.
"""

from pydantic import BaseModel, Field


class SecurityVulnerability(BaseModel):
    """A detected security vulnerability."""
    id: str = Field(..., description="Unique vulnerability identifier")
    severity: str = Field(..., description="critical, high, medium, low")
    category: str = Field(..., description="Category of vulnerability (e.g., Authentication)")
    location: str = Field(..., description="Dot-path location")
    description: str = Field(..., description="Human-readable description")
    remediation: str = Field(..., description="Actionable fix suggestion")


class SecurityAuditResult(BaseModel):
    """Result of the security audit."""
    passed: bool = Field(..., description="Whether the audit passed without critical issues")
    vulnerabilities: list[SecurityVulnerability] = Field(default_factory=list, description="List of vulnerabilities")
    checks_performed: list[str] = Field(default_factory=list, description="List of checks that ran")

    @property
    def has_critical(self) -> bool:
        return any(v.severity == "critical" for v in self.vulnerabilities)
