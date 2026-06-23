export const MOCK_DATA = {
  intent: {
    app_name: "CRM",
    domain: "Customer Relationship Management",
    features: {
      authentication: [
        "email",
        "google"
      ],
      contacts: true,
      dashboard: true,
      role_based_access: true,
      analytics: true,
      subscriptions: true,
      payments: true
    },
    roles: ["Admin", "Manager", "Sales", "User"],
    authentication: {
      methods: ["email", "google"]
    },
    payments: true,
    analytics: true,
    premium: true
  },
  architecture: {
    frontend: {
      framework: "Next.js 14 (App Router)",
      styling: "Tailwind CSS + shadcn/ui",
      state_management: "Zustand",
      data_fetching: "React Query / Server Actions"
    },
    backend: {
      framework: "Next.js Route Handlers",
      orm: "Prisma",
      database: "PostgreSQL (Supabase)",
      authentication: "NextAuth.js v5",
      payments: "Stripe API"
    },
    infrastructure: {
      hosting: "Vercel",
      caching: "Vercel KV (Redis)",
      storage: "AWS S3 / Supabase Storage"
    }
  },
  uiSchema: {
    routes: [
      { path: "/", component: "LandingPage", public: true },
      { path: "/login", component: "AuthPage", public: true },
      { path: "/dashboard", component: "DashboardLayout", roles: ["user", "admin"] },
      { path: "/dashboard/contacts", component: "ContactsTable", roles: ["user", "admin"] },
      { path: "/dashboard/analytics", component: "AnalyticsCharts", roles: ["admin", "premium"] },
      { path: "/settings/billing", component: "SubscriptionManager", roles: ["user", "admin"] }
    ],
    components: {
      Sidebar: { props: ["userRole", "activePath"] },
      MetricCard: { props: ["title", "value", "trend"] },
      DataTable: { props: ["columns", "data", "onSort"] }
    }
  },
  apiSchema: {
    endpoints: [
      {
        path: "/api/contacts",
        method: "GET",
        auth_required: true,
        response_type: "Contact[]",
        rate_limit: "100/min"
      },
      {
        path: "/api/contacts",
        method: "POST",
        auth_required: true,
        body: {
          name: "string",
          email: "string",
          company: "string?"
        },
        response_type: "Contact"
      },
      {
        path: "/api/webhooks/stripe",
        method: "POST",
        auth_required: false,
        notes: "Verifies Stripe signature before processing subscription updates."
      }
    ]
  },
  databaseSchema: {
    models: {
      User: {
        id: "UUID @id",
        email: "String @unique",
        role: "Enum(USER, ADMIN) @default(USER)",
        subscriptionTier: "Enum(FREE, PREMIUM) @default(FREE)",
        createdAt: "DateTime @default(now())",
        contacts: "Contact[]"
      },
      Contact: {
        id: "UUID @id",
        userId: "UUID @relation(User)",
        name: "String",
        email: "String",
        company: "String?",
        status: "Enum(LEAD, ACTIVE, CHURNED)",
        createdAt: "DateTime @default(now())"
      }
    },
    relations: [
      "User.id (1) -> Contact.userId (N)"
    ]
  },
  authRules: {
    strategy: "Session (JWT)",
    roles: {
      USER: {
        permissions: ["read:own_contacts", "create:contacts", "update:own_contacts"]
      },
      PREMIUM: {
        inherits: "USER",
        permissions: ["read:analytics", "export:contacts"]
      },
      ADMIN: {
        permissions: ["read:all_contacts", "delete:any_contact", "manage:users"]
      }
    }
  },
  validationReport: {
    total_issues: 2,
    issues: [
      {
        severity: "HIGH",
        code: "VAL_SCHEMA_MISMATCH",
        description: "API schema mismatch: expected userId but received user_id",
        affected_nodes: ["apiSchema", "databaseSchema"]
      },
      {
        severity: "MEDIUM",
        code: "VAL_MISSING_INDEX",
        description: "Missing database index on frequently queried field: email",
        affected_nodes: ["databaseSchema"]
      }
    ]
  },
  executionReport: {
    status: "PASS",
    routes_generated: 14,
    api_endpoints: 28,
    db_tables: 14,
    rbac_policies: 12,
    ui_pages: 22,
    latency_ms: 1240
  }
};
