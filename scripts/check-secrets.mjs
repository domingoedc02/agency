import { execFileSync } from "node:child_process";

const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((file) => !file.endsWith(".lock"));

const forbidden =
  /(?:sk_(?:live|test)_[A-Za-z0-9]+|re_(?:live|test)_[A-Za-z0-9]+|-----BEGIN (?:RSA|EC|OPENSSH|PRIVATE) KEY-----|(?:api[_-]?key|secret|token)\s*[:=]\s*["']?[A-Za-z0-9_\-/+=]{24,})/i;

for (const file of tracked) {
  if (file === ".env.example" || file.endsWith(".md")) continue;
  const content = execFileSync("git", ["show", `HEAD:${file}`], {
    encoding: "utf8",
  });
  if (forbidden.test(content)) {
    console.error(`Potential secret material found in tracked file: ${file}`);
    process.exit(1);
  }
}
