import { flow } from "./config.mjs";

const activation = flow.activation || {};

/** Solo activa el agente si el contacto viene de web, Meta Ads o Google Ads. */
export function isCampaignSource(text, referral) {
  if (referral && isAdReferral(referral)) return true;

  const body = String(text || "");
  const lower = body.toLowerCase();

  const token = (activation.campaignToken || "LA-BUSQ30").toLowerCase();
  if (lower.includes(token)) return true;

  if (/\(ref:\s*(meta|google|paid)\b/i.test(body)) return true;

  const triggers = activation.entryTriggers || flow.entryTriggers || [];
  if (triggers.some((t) => lower.includes(String(t).toLowerCase()))) return true;

  return false;
}

function isAdReferral(referral) {
  if (referral.ctwa_clid) return true;
  const type = String(referral.source_type || "").toLowerCase();
  const allowed = activation.referralSourceTypes || ["ad", "post"];
  return allowed.includes(type);
}

export function detectSource(text, referral) {
  if (referral?.ctwa_clid || referral?.source_type === "ad") return "meta_ads";
  if (referral) return `referral_${referral.source_type || "unknown"}`;

  const body = String(text || "");
  if (/\(ref:\s*google/i.test(body)) return "google_ads";
  if (/\(ref:\s*meta/i.test(body)) return "meta_web";
  if (/\(ref:\s*paid/i.test(body)) return "paid_web";
  if (body.toLowerCase().includes((activation.campaignToken || "la-busq30").toLowerCase())) {
    return "landing";
  }
  return "campaign_text";
}
