/** WhatsApp usa *negrita* con un asterisco, no markdown ** */
export function waFormat(text) {
  return String(text || "")
    .replace(/\*\*(.*?)\*\*/g, "*$1*")
    .replace(/\n{3,}/g, "\n\n");
}

export function withOptions(text, options) {
  if (!options?.length) return waFormat(text);
  const lines = options.map((o, i) => `${i + 1}. ${o}`);
  return waFormat(`${text}\n\n${lines.join("\n")}`);
}
