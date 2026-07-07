import { flow } from "./config.mjs";

const stateById = Object.fromEntries(flow.states.map((s) => [s.id, s]));

/** Convierte "1", "2", etc. en la opción de quick reply del paso actual. */
export function resolveQuickReply(stepId, text) {
  const state = stateById[stepId];
  if (!state?.quickReplies?.length) return text;

  const trimmed = String(text || "").trim();
  const num = Number(trimmed);
  if (Number.isInteger(num) && num >= 1 && num <= state.quickReplies.length) {
    return state.quickReplies[num - 1];
  }
  return trimmed;
}
