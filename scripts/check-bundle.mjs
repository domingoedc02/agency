import { readFileSync } from "node:fs";
import { join } from "node:path";

const buildManifest = join(process.cwd(), ".next", "build-manifest.json");
const manifest = JSON.parse(readFileSync(buildManifest, "utf8"));
const files = [...new Set(Object.values(manifest.pages).flat())];
const totalBytes = files.reduce(
  (sum, file) =>
    sum + readFileSync(join(process.cwd(), ".next", file)).byteLength,
  0,
);
const limit = 350 * 1024;
if (totalBytes > limit) {
  throw new Error(
    `Initial route JavaScript exceeds ${limit} bytes: ${totalBytes}`,
  );
}
console.log(
  JSON.stringify({
    initialRouteJavaScriptBytes: totalBytes,
    limitBytes: limit,
  }),
);
