import { flow, messages } from "./config.mjs";
import { detectSource, isCampaignSource } from "./activation.mjs";
import { notifyJose } from "./notify-jose.mjs";
import { resolveQuickReply } from "./quick-reply.mjs";
import { saveSession } from "./sessions-store.mjs";
import { sendText } from "./wa-send.mjs";
import { waFormat, withOptions } from "./wa-format.mjs";

const stateById = Object.fromEntries(flow.states.map((s) => [s.id, s]));

const COLLECT_ORDER = ["objective", "budget", "zone", "timeline", "location"];

function shouldEscalate(text) {
  const lower = text.toLowerCase();
  return flow.escalateToHuman.some((k) => lower.includes(k));
}

function matchRule(data, rule) {
  if (rule.all && !rule.all.every((r) => matchField(data, r))) return false;
  if (rule.any && !rule.any.some((r) => matchField(data, r))) return false;
  if (rule.field && !matchField(data, rule)) return false;
  return true;
}

function matchField(data, rule) {
  const val = data[rule.field] || "";
  if (rule.in) return rule.in.includes(val);
  if (rule.notIn) return !rule.notIn.includes(val);
  return true;
}

function qualifyBranch(data) {
  const { qualifyRules } = flow;
  if (matchRule(data, qualifyRules.not_fit)) return "not_fit";
  if (matchRule(data, qualifyRules.soft_nurture)) return "soft_nurture";
  if (matchRule(data, qualifyRules.offer_fit)) return "offer_fit";
  return "soft_nurture";
}

function msg(key) {
  return messages[key] || messages.fallback;
}

async function promptStep(waId, stepId) {
  const state = stateById[stepId];
  const body = state.quickReplies
    ? withOptions(msg(state.messageKey), state.quickReplies)
    : waFormat(msg(state.messageKey));
  await sendText(waId, body);
}

async function runBranch(waId, session, branchId) {
  if (branchId === "offer_fit") {
    await sendText(waId, waFormat(msg("offer_summary")));
    await sendText(waId, waFormat(msg("send_calendar")));
    await notifyJose(session, "lead-busqueda-30");
    session.step = "end";
    return;
  }
  if (branchId === "soft_nurture") {
    await sendText(waId, waFormat(msg("nurture_exploring")));
    await sendText(waId, waFormat(msg("send_calendar_diagnostico")));
    await notifyJose(session, "lead-explorando");
    session.step = "end";
    return;
  }
  if (branchId === "not_fit") {
    await sendText(waId, waFormat(msg("not_fit")));
    session.step = "end";
    return;
  }
  if (branchId === "human_escalation") {
    await sendText(waId, waFormat(msg("human_handoff")));
    await notifyJose(session, "escalacion-humana");
    session.step = "end";
  }
}

export function createSession(waId) {
  return { waId, step: "new", data: {}, agentActive: false };
}

function persist(session) {
  saveSession(session);
}

export async function handleInbound(session, text, referral) {
  const body = (text || "").trim();
  if (!body) return;

  const resolved =
    COLLECT_ORDER.includes(session.step) ? resolveQuickReply(session.step, body) : body;

  if (session.step === "direct") {
    if (isCampaignSource(body, referral)) {
      session.step = "new";
      session.agentActive = false;
      session.data = {};
    } else {
      return;
    }
  }

  if (shouldEscalate(body) && session.agentActive) {
    await runBranch(session.waId, session, "human_escalation");
    persist(session);
    return;
  }

  if (session.step === "end") {
    if (body.toLowerCase() === "reiniciar") {
      session.step = "new";
      session.data = {};
    } else {
      await sendText(
        session.waId,
        waFormat(
          `Si quieres agendar: ${flow.calendarUrl}\n\nEscribe *reiniciar* para empezar de nuevo.`
        )
      );
      persist(session);
      return;
    }
  }

  if (session.step === "new") {
    if (!isCampaignSource(body, referral)) {
      session.step = "direct";
      persist(session);
      return;
    }
    session.agentActive = true;
    session.data.source = detectSource(body, referral);
    await sendText(session.waId, waFormat(msg("welcome")));
    await promptStep(session.waId, "objective");
    session.step = "objective";
    persist(session);
    return;
  }

  const collectIdx = COLLECT_ORDER.indexOf(session.step);
  if (collectIdx >= 0) {
    const state = stateById[session.step];
    session.data[state.collect] = resolved;

    if (session.step === "location") {
      await runBranch(session.waId, session, qualifyBranch(session.data));
      persist(session);
      return;
    }

    const nextStep = COLLECT_ORDER[collectIdx + 1];
    await promptStep(session.waId, nextStep);
    session.step = nextStep;
    persist(session);
    return;
  }

  await sendText(session.waId, waFormat(messages.fallback));
  persist(session);
}
