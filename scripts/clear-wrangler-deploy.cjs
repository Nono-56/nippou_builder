const fs = require("node:fs");
const path = require("node:path");

const deployDir = path.join(process.cwd(), ".wrangler", "deploy");

try {
  fs.rmSync(deployDir, { recursive: true, force: true });
} catch (error) {
  console.warn(`[clear-wrangler-deploy] Failed to remove ${deployDir}:`, error);
  process.exitCode = 1;
}
