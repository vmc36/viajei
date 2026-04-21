import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY_MISSING");
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

export const ANTHROPIC_MODEL = "claude-opus-4-7";
