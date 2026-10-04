import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

mkdirSync("artifacts", { recursive: true });
const sha =
  process.env.GITHUB_SHA ??
  execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
writeFileSync(
  "artifacts/ci-evidence.json",
  JSON.stringify(
    {
      sha,
      generatedAt: new Date().toISOString(),
      checks: [
        "lint",
        "typecheck",
        "format",
        "test",
        "build",
        "secret-scan",
        "dependency-audit",
      ],
    },
    null,
    2,
  ) + "\n",
);
