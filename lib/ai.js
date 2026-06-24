import Anthropic from "@anthropic-ai/sdk";
import {
  EXTRACTION_SYSTEM,
  EXTRACTION_USER_TEXT,
  BRIEF_SYSTEM,
  buildChatSystemPrompt,
  COMPARE_SYSTEM,
  STRESS_TEST_SYSTEM,
  SURPRISE_SYSTEM,
} from "./prompts";

const MODEL = "claude-sonnet-4-6";

// Basic web search tool. No dynamic filtering needed for this app's use
// cases (consensus lookups, market context), so the simplest stable tool
// version is sufficient. Requires web search to be enabled for the
// organization in the model provider's console (Settings > Privacy).
const WEB_SEARCH_TOOL = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 5,
};

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set on the server. Add it to .env.local (or your Vercel project's environment variables) and restart."
    );
  }
  return new Anthropic({ apiKey });
}

function textFromResponse(response) {
  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

// When a call uses server tools (web_search), the model may emit earlier
// "I'll search for..." text blocks before its final answer. The final text
// block is the one that actually contains the JSON we asked for, so callers
// that enable tools should use this instead of joining every text block.
function finalTextFromResponse(response) {
  const textBlocks = (response.content || []).filter((b) => b.type === "text");
  if (textBlocks.length === 0) {
    throw new Error("The model returned no text content.");
  }
  return textBlocks[textBlocks.length - 1].text;
}

// Best-effort repair for the most common way the model's JSON output breaks:
// quoting a word or phrase inside a string value with a literal double
// quote (e.g. "...mentions \"rising labor costs\"..." without the escapes),
// which prematurely closes the JSON string. A real double-quote character
// that is structurally valid JSON always sits immediately next to one of
// { [ , : (opening a key/string) or : , } ] (closing one), modulo
// whitespace. Any quote that doesn't border one of those is almost
// certainly an unescaped quote inside a string value, so we escape it and
// retry. This is a heuristic safety net on top of the prompt-level
// instruction telling the model to use single quotes instead — it should
// rarely be needed, but keeps a stray slip from surfacing as a hard error.
function repairUnescapedQuotes(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch !== '"') {
      result += ch;
      continue;
    }
    if (str[i - 1] === "\\") {
      result += ch;
      continue;
    }
    const trimmedResult = result.replace(/\s+$/, "");
    const before = trimmedResult.slice(-1);
    let j = i + 1;
    while (j < str.length && /\s/.test(str[j])) j++;
    const after = str[j];
    const bordersOpen = before === "" || ["{", "[", ",", ":"].includes(before);
    const bordersClose = after === undefined || ["}", "]", ",", ":"].includes(after);
    if (bordersOpen || bordersClose) {
      result += ch;
    } else {
      result += '\\"';
    }
  }
  return result;
}

function parseJSON(raw) {
  if (!raw) throw new Error("The model returned an empty response.");
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    try {
      return JSON.parse(repairUnescapedQuotes(cleaned));
    } catch {
      throw new Error(
        "The model's response could not be parsed as JSON: " + err.message
      );
    }
  }
}

// Server tools (like web_search) can return stop_reason "pause_turn" when
// the model wants to keep working across multiple turns server-side. Feed
// the conversation back until it actually finishes, bounded so a stuck loop
// can't run forever.
async function createWithTools(client, params) {
  let messages = params.messages;
  let response = await client.messages.create(params);
  let guard = 0;
  while (response.stop_reason === "pause_turn" && guard < 3) {
    messages = [...messages, { role: "assistant", content: response.content }];
    response = await client.messages.create({ ...params, messages });
    guard++;
  }
  return response;
}

export async function extractFinancialData(base64Pdf, filename) {
  const client = getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: EXTRACTION_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Pdf,
            },
          },
          {
            type: "text",
            text: `Document filename: ${filename}\n\n${EXTRACTION_USER_TEXT}`,
          },
        ],
      },
    ],
  });
  return parseJSON(textFromResponse(response));
}

export async function generateBrief(extracted) {
  const client = getClient();
  const response = await createWithTools(client, {
    model: MODEL,
    max_tokens: 2560,
    system: BRIEF_SYSTEM,
    tools: [WEB_SEARCH_TOOL],
    messages: [{ role: "user", content: JSON.stringify(extracted) }],
  });
  return parseJSON(finalTextFromResponse(response));
}

export async function chatWithDocuments(messages, documents) {
  const client = getClient();
  const system = buildChatSystemPrompt(documents);
  const response = await createWithTools(client, {
    model: MODEL,
    max_tokens: 2048,
    system,
    tools: [WEB_SEARCH_TOOL],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  return parseJSON(finalTextFromResponse(response));
}

// Cross-document comparison: the model only writes the one-line "what drove
// this" commentary. The metric values and deltas themselves are computed
// deterministically in lib/compare.js and passed in already-correct — no
// re-processing of the source documents, and no risk of arithmetic drift.
// Deliberately no web_search tool here: this feature is scoped to stay
// grounded in the uploaded documents' own data. Works for any number of
// documents (2 or more).
export async function compareDocuments(metricsTable, docs) {
  const client = getClient();
  const payload = {
    metrics: metricsTable,
    documents: docs.map((d) => ({ name: d.name, extracted: d.extracted })),
  };
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1536,
    system: COMPARE_SYSTEM,
    messages: [{ role: "user", content: JSON.stringify(payload) }],
  });
  return parseJSON(finalTextFromResponse(response));
}

export async function runStressTest(assumption, extracted, brief) {
  const client = getClient();
  const payload = { assumption, extracted, brief };
  const response = await createWithTools(client, {
    model: MODEL,
    max_tokens: 1536,
    system: STRESS_TEST_SYSTEM,
    tools: [WEB_SEARCH_TOOL],
    messages: [{ role: "user", content: JSON.stringify(payload) }],
  });
  return parseJSON(finalTextFromResponse(response));
}

export async function detectEarningsSurprise(extracted) {
  const client = getClient();
  const response = await createWithTools(client, {
    model: MODEL,
    max_tokens: 2048,
    system: SURPRISE_SYSTEM,
    tools: [{ ...WEB_SEARCH_TOOL, max_uses: 8 }],
    messages: [{ role: "user", content: JSON.stringify(extracted) }],
  });
  return parseJSON(finalTextFromResponse(response));
}
