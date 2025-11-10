import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      // ✅ Disable noisy blockers
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "off",

      // ✅ Allow <img> temporarily (Next.js recommends <Image>, but we won’t block build)
      "@next/next/no-img-element": "warn",

      // ✅ Hooks and dependencies only warn
      "react-hooks/exhaustive-deps": "warn",

      // ✅ Avoid blocking build for unassigned consts or similar issues
      "prefer-const": "warn",

      // ✅ Ignore undefined variable warnings for dynamic roles etc.
      "no-undef": "off",

      // ✅ Disable prop-types requirement (unneeded in TS)
      "react/prop-types": "off",
    },
  },
];

export default eslintConfig;
