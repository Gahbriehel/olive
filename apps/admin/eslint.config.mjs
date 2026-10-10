import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Design tokens only (docs/architecture.md §6.1): raw Tailwind palette classes
// and arbitrary pixel text sizes are errors in migrated folders. Add folders
// here as pages are migrated.
const RAW_PALETTE =
  "(^|\\s|:)(bg|text|border|divide|ring|fill|stroke|placeholder|from|via|to|shadow|outline|decoration|accent|caret)(-[trblxy])?-(slate|zinc|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]";
const ARBITRARY_TEXT = "text-\\[[0-9.]+(px|rem)\\]";
const tokenMessage =
  "Use design-token utilities (bg-surface, text-fg-muted, bg-primary, ...) instead of raw palette classes or arbitrary text sizes. See docs/architecture.md §6.1.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/components/ui/**/*.tsx",
      "src/components/FormElements/**/*.tsx",
      "src/components/layout/**/*.tsx",
      "src/app/**/*.tsx",
    ],
    // Intentionally always-dark screens; see docs/architecture.md §6.1.
    ignores: ["src/app/(auth)/login/page.tsx", "src/app/not-found.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...[RAW_PALETTE, ARBITRARY_TEXT].flatMap((pattern) => [
          { selector: `Literal[value=/${pattern}/]`, message: tokenMessage },
          {
            selector: `TemplateElement[value.raw=/${pattern}/]`,
            message: tokenMessage,
          },
        ]),
      ],
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
