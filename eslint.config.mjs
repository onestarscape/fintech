import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Hand-written src/types/database.ts (placeholder until `supabase gen
      // types` is run against a real project) can't type Postgrest's
      // embedded-resource joins. A few call sites use `any` deliberately —
      // see the comment at the top of database.ts. Downgraded, not disabled,
      // so genuinely careless `any` usage still surfaces in review.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
