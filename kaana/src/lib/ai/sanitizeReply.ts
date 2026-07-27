/** Strip markdown / outline artifacts from model replies for plain chat UI */
export function sanitizeChatReply(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/Sentence\s+\d+\s*\([^)]*\):?\s*/gi, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/\):\*\*\s*/g, "")
    .replace(/\* \*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}
