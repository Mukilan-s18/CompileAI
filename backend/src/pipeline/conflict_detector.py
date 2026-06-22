"""Prompt Conflict Detector & Clarification Engine.

Analyzes user prompts for ambiguity, conflicts, and underspecification.
Returns structured clarification questions when issues are found,
or proceeds with documented assumptions when issues are minor.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


class ConflictType(str, Enum):
    """Types of prompt conflicts detected."""
    CONTRADICTORY = "contradictory"        # Two requirements directly oppose each other
    AMBIGUOUS = "ambiguous"                # Requirements are unclear
    UNDERSPECIFIED = "underspecified"      # Critical details are missing
    OVERLOADED = "overloaded"             # Too many features for coherent output
    ROLE_CONFLICT = "role_conflict"        # Role permissions contradict


@dataclass
class ConflictItem:
    """A single detected conflict or ambiguity."""
    conflict_type: ConflictType
    description: str
    severity: str  # "high", "medium", "low"
    suggestion: str
    clarifying_question: str


@dataclass
class ClarificationResult:
    """Result of prompt conflict analysis."""
    needs_clarification: bool
    confidence_score: float  # 0.0 = very unclear, 1.0 = crystal clear
    conflicts: list[ConflictItem] = field(default_factory=list)
    auto_assumptions: list[str] = field(default_factory=list)
    prompt_quality: str = "good"  # "excellent", "good", "fair", "poor"

    def to_dict(self) -> dict:
        return {
            "needs_clarification": self.needs_clarification,
            "confidence_score": self.confidence_score,
            "prompt_quality": self.prompt_quality,
            "conflicts": [
                {
                    "type": c.conflict_type.value,
                    "description": c.description,
                    "severity": c.severity,
                    "suggestion": c.suggestion,
                    "clarifying_question": c.clarifying_question,
                }
                for c in self.conflicts
            ],
            "auto_assumptions": self.auto_assumptions,
        }


class ConflictDetector:
    """Detects conflicts, ambiguities, and underspecification in prompts.

    This is a rule-based system (no LLM calls needed) that analyzes
    prompt text for common issues before sending to the pipeline.
    """

    # Contradiction patterns — pairs of terms that conflict
    CONTRADICTION_PAIRS = [
        (r"\bno\s+auth", r"\blogin|sign.?in|authenticate"),
        (r"\bno\s+login", r"\bpersonalized|user.?specific|my\s+dashboard"),
        (r"\bpublic\b.*\baccess\b", r"\brole.?based|restricted|permission"),
        (r"\beveryone\b.*\bdelete\b", r"\bno.?one\b.*\bdelete|cannot.?delete"),
        (r"\ball\s+users\s+are\s+admin", r"\brestricted|limited\s+access"),
        (r"\bfree\b", r"\bpremium|paid|subscription|payment"),
        (r"\bno\s+database", r"\bstore|save|persist|track"),
        (r"\boffline\b", r"\breal.?time|live.?update|websocket"),
    ]

    # Vagueness indicators
    VAGUE_TERMS = [
        "good", "nice", "professional", "modern", "cool", "great",
        "beautiful", "sleek", "user-friendly", "intuitive", "smart",
        "powerful", "efficient", "robust", "scalable", "enterprise",
    ]

    # Feature keywords for specificity detection
    FEATURE_KEYWORDS = [
        "login", "register", "dashboard", "profile", "settings",
        "payment", "subscription", "analytics", "report", "notification",
        "search", "filter", "export", "import", "upload", "download",
        "chat", "message", "comment", "review", "rating", "booking",
        "calendar", "schedule", "inventory", "order", "cart", "checkout",
        "user", "admin", "role", "permission", "team", "organization",
    ]

    def analyze(self, prompt: str) -> ClarificationResult:
        """Analyze a prompt for conflicts and ambiguities.

        Args:
            prompt: The raw natural language prompt.

        Returns:
            ClarificationResult with detected issues.
        """
        conflicts: list[ConflictItem] = []
        assumptions: list[str] = []
        prompt_lower = prompt.lower()

        # 1. Check for contradictions
        self._check_contradictions(prompt_lower, conflicts)

        # 2. Check prompt length / underspecification
        self._check_underspecification(prompt, prompt_lower, conflicts, assumptions)

        # 3. Check for excessive vagueness
        self._check_vagueness(prompt_lower, conflicts, assumptions)

        # 4. Check for feature overload
        self._check_overload(prompt_lower, conflicts)

        # 5. Check for role conflicts
        self._check_role_conflicts(prompt_lower, conflicts)

        # Calculate confidence score
        high_conflicts = sum(1 for c in conflicts if c.severity == "high")
        medium_conflicts = sum(1 for c in conflicts if c.severity == "medium")
        low_conflicts = sum(1 for c in conflicts if c.severity == "low")

        confidence = max(0.0, 1.0 - (high_conflicts * 0.3) - (medium_conflicts * 0.15) - (low_conflicts * 0.05))

        # Determine prompt quality
        if confidence >= 0.85:
            quality = "excellent"
        elif confidence >= 0.65:
            quality = "good"
        elif confidence >= 0.40:
            quality = "fair"
        else:
            quality = "poor"

        # Only need clarification for high-severity issues
        needs_clarification = high_conflicts > 0

        return ClarificationResult(
            needs_clarification=needs_clarification,
            confidence_score=round(confidence, 2),
            conflicts=conflicts,
            auto_assumptions=assumptions,
            prompt_quality=quality,
        )

    def _check_contradictions(
        self, prompt_lower: str, conflicts: list[ConflictItem]
    ) -> None:
        """Detect contradictory requirements."""
        for pattern_a, pattern_b in self.CONTRADICTION_PAIRS:
            match_a = re.search(pattern_a, prompt_lower)
            match_b = re.search(pattern_b, prompt_lower)
            if match_a and match_b:
                conflicts.append(ConflictItem(
                    conflict_type=ConflictType.CONTRADICTORY,
                    description=f"Contradictory requirements detected: '{match_a.group()}' conflicts with '{match_b.group()}'",
                    severity="high",
                    suggestion="Resolve the contradiction by choosing one requirement",
                    clarifying_question=f"Your prompt mentions both '{match_a.group()}' and '{match_b.group()}', which seem contradictory. Which should take priority?",
                ))

    def _check_underspecification(
        self,
        prompt: str,
        prompt_lower: str,
        conflicts: list[ConflictItem],
        assumptions: list[str],
    ) -> None:
        """Check for critically underspecified prompts."""
        words = prompt.split()
        feature_matches = sum(
            1 for kw in self.FEATURE_KEYWORDS if kw in prompt_lower
        )

        if len(words) <= 3:
            conflicts.append(ConflictItem(
                conflict_type=ConflictType.UNDERSPECIFIED,
                description="Prompt is extremely brief (3 words or fewer)",
                severity="high" if feature_matches == 0 else "medium",
                suggestion="Provide more details about features, user roles, and workflows",
                clarifying_question="Your prompt is very brief. Could you describe the key features, user roles, and workflows you need?",
            ))
            assumptions.append("Generated a comprehensive feature set based on inferred domain")

        elif len(words) <= 10 and feature_matches < 2:
            conflicts.append(ConflictItem(
                conflict_type=ConflictType.UNDERSPECIFIED,
                description="Prompt lacks specific feature details",
                severity="medium",
                suggestion="Add concrete features like login, dashboard, roles, etc.",
                clarifying_question="Could you specify which features are most important? For example: user authentication, dashboards, reports, payments?",
            ))
            assumptions.append("Inferred standard features for the detected domain")

        # Check for missing role specification
        role_keywords = ["admin", "user", "manager", "role", "permission", "access"]
        has_roles = any(kw in prompt_lower for kw in role_keywords)
        if not has_roles and len(words) > 10:
            assumptions.append("No roles specified — defaulting to Admin and User roles")

    def _check_vagueness(
        self,
        prompt_lower: str,
        conflicts: list[ConflictItem],
        assumptions: list[str],
    ) -> None:
        """Check for excessive use of vague terms without specifics."""
        vague_count = sum(1 for term in self.VAGUE_TERMS if term in prompt_lower)
        feature_count = sum(1 for kw in self.FEATURE_KEYWORDS if kw in prompt_lower)

        if vague_count >= 3 and feature_count <= 1:
            conflicts.append(ConflictItem(
                conflict_type=ConflictType.AMBIGUOUS,
                description=f"Prompt uses {vague_count} vague terms but only {feature_count} specific feature(s)",
                severity="medium",
                suggestion="Replace vague descriptions with concrete features",
                clarifying_question="Your description uses general terms. Could you list 3-5 specific features your application needs?",
            ))
            assumptions.append("Interpreted vague requirements as standard domain features")

    def _check_overload(
        self, prompt_lower: str, conflicts: list[ConflictItem]
    ) -> None:
        """Detect prompts with too many disparate features."""
        feature_count = sum(1 for kw in self.FEATURE_KEYWORDS if kw in prompt_lower)

        # Also check for "super app" or multi-domain keywords
        multi_domain = sum(1 for domain in [
            "crm", "hrms", "ecommerce", "social media", "messaging",
            "video call", "project management", "analytics", "inventory",
        ] if domain in prompt_lower)

        if multi_domain >= 4 or feature_count >= 15:
            conflicts.append(ConflictItem(
                conflict_type=ConflictType.OVERLOADED,
                description=f"Prompt requests {multi_domain} distinct application domains with {feature_count}+ features",
                severity="medium",
                suggestion="Consider breaking this into multiple applications or prioritizing core features",
                clarifying_question="This is a very ambitious scope. Which 3-5 features are the highest priority for the initial version?",
            ))

    def _check_role_conflicts(
        self, prompt_lower: str, conflicts: list[ConflictItem]
    ) -> None:
        """Detect role-related conflicts."""
        # Check for "all users are admins" type contradictions
        if re.search(r"all\s+users?\s+(?:are|have)\s+admin", prompt_lower):
            if re.search(r"restrict|limit|permission|guard", prompt_lower):
                conflicts.append(ConflictItem(
                    conflict_type=ConflictType.ROLE_CONFLICT,
                    description="All users are admins but access restrictions are also requested",
                    severity="high",
                    suggestion="Define a clear role hierarchy with distinct permission levels",
                    clarifying_question="If all users are admins, what restrictions should still apply? Should there be a super-admin role?",
                ))


# Singleton
conflict_detector = ConflictDetector()
