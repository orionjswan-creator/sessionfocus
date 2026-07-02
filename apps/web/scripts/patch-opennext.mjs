import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const handlerPath = join(process.cwd(), ".open-next", "server-functions", "default", "apps", "web", "handler.mjs");
const source = readFileSync(handlerPath, "utf8");

const dynamicMiddlewareRequire =
  "getMiddlewareManifest(){return this.minimalMode?null:require(this.middlewareManifestPath)}";
const emptyMiddlewareManifest =
  "getMiddlewareManifest(){return {version:3,middleware:{},functions:{},sortedMiddleware:[]}}";

if (!source.includes(dynamicMiddlewareRequire) && !source.includes(emptyMiddlewareManifest)) {
  throw new Error("OpenNext middleware manifest patch target was not found.");
}

if (source.includes(dynamicMiddlewareRequire)) {
  writeFileSync(handlerPath, source.replace(dynamicMiddlewareRequire, emptyMiddlewareManifest));
  console.log("Patched OpenNext empty middleware manifest require.");
} else {
  console.log("OpenNext empty middleware manifest require already patched.");
}
