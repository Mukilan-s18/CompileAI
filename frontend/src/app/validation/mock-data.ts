export type ErrorSeverity = "CRITICAL" | "ERROR" | "WARNING" | "INFO";
export type ErrorCategory = "Schema" | "Type" | "Cross-Layer" | "Business Logic";

export interface ValidationError {
  id: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  file: string;
  line?: number;
  message: string;
  cause: string;
  repairAction: string;
  timestamp: string;
}

export const VALIDATION_ERRORS: ValidationError[] = [
  {
    id: "VAL-001",
    severity: "CRITICAL",
    category: "Cross-Layer",
    file: "src/app/api/contacts/route.ts",
    line: 42,
    message: "Type mismatch between API response and Frontend expectations.",
    cause: "The API endpoint returns { data: Contact[] }, but the frontend ContactsTable component expects Contact[] directly.",
    repairAction: "Modify frontend data fetching to extract the `data` property from the JSON response before passing it to the table.",
    timestamp: "2026-06-23T14:02:11Z"
  },
  {
    id: "VAL-002",
    severity: "ERROR",
    category: "Schema",
    file: "prisma/schema.prisma",
    line: 18,
    message: "Missing relation scalar field in Prisma schema.",
    cause: "The Contact model defines a relation to User, but missing the `userId` scalar field required by Prisma.",
    repairAction: "Add `userId String` to the Contact model and update the relation: `@relation(fields: [userId], references: [id])`.",
    timestamp: "2026-06-23T14:02:12Z"
  },
  {
    id: "VAL-003",
    severity: "WARNING",
    category: "Business Logic",
    file: "src/lib/auth.ts",
    line: 114,
    message: "Insecure default role assignment.",
    cause: "New signups are automatically granted 'ADMIN' role in the fallback logic if the role is missing from the OAuth provider.",
    repairAction: "Change fallback role from 'ADMIN' to 'USER'.",
    timestamp: "2026-06-23T14:02:13Z"
  },
  {
    id: "VAL-004",
    severity: "ERROR",
    category: "Type",
    file: "src/components/dashboard/AnalyticsCharts.tsx",
    line: 8,
    message: "Property 'revenue' does not exist on type 'AnalyticsData'.",
    cause: "The component attempts to map over data and access `item.revenue`, but the inferred type of AnalyticsData only contains `views` and `clicks`.",
    repairAction: "Update the AnalyticsData interface to include `revenue: number` and ensure the API populates it.",
    timestamp: "2026-06-23T14:02:14Z"
  },
  {
    id: "VAL-005",
    severity: "WARNING",
    category: "Schema",
    file: "prisma/schema.prisma",
    line: 22,
    message: "Missing database index on frequently queried field.",
    cause: "The `email` field on the User model is heavily queried during authentication but lacks an index.",
    repairAction: "Add `@@index([email])` to the User model.",
    timestamp: "2026-06-23T14:02:14Z"
  },
  {
    id: "VAL-006",
    severity: "INFO",
    category: "Business Logic",
    file: "src/app/api/webhooks/stripe/route.ts",
    line: 5,
    message: "No explicit rate limiting on public webhook endpoint.",
    cause: "The Stripe webhook endpoint relies solely on signature verification. A barrage of invalid requests could consume serverless function duration.",
    repairAction: "Implement Upstash Redis rate limiting to throttle excessive requests from unknown IPs.",
    timestamp: "2026-06-23T14:02:15Z"
  }
];
