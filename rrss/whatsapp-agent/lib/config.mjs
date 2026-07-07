import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadDotEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

const fileEnv = loadDotEnv();

export const config = {
  graphVersion: process.env.META_GRAPH_VERSION || fileEnv.META_GRAPH_VERSION || "v22.0",
  waToken: process.env.META_WA_ACCESS_TOKEN || fileEnv.META_WA_ACCESS_TOKEN || "",
  phoneNumberId: process.env.META_WA_PHONE_NUMBER_ID || fileEnv.META_WA_PHONE_NUMBER_ID || "",
  verifyToken: process.env.META_WA_VERIFY_TOKEN || fileEnv.META_WA_VERIFY_TOKEN || "",
  notifyWebhook: process.env.LA_NOTIFY_WEBHOOK_URL || fileEnv.LA_NOTIFY_WEBHOOK_URL || "",
  port: Number(process.env.PORT || fileEnv.PORT || 8787),
};

export const flow = JSON.parse(fs.readFileSync(path.join(ROOT, "flow.json"), "utf8"));
export const messages = JSON.parse(fs.readFileSync(path.join(ROOT, "messages.json"), "utf8"));

export { ROOT };
