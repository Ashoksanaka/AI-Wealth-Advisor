const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
export const DEFAULT_TEXT_MODEL = "deepseek-ai/deepseek-v3.1";
const DEFAULT_VISION_MODEL = "meta/llama-3.2-11b-vision-instruct";
const NVIDIA_FETCH_TIMEOUT_MS = 45_000;

export const ADVISOR_MODEL_FALLBACKS = [
  "meta/llama-3.1-8b-instruct",
  "deepseek-ai/deepseek-v3.1-terminus",
  DEFAULT_TEXT_MODEL,
];

export function isDeepSeekV4Model(modelId) {
  return /deepseek-v4/i.test(modelId || "");
}

export function supportsNvidiaStreaming(modelId) {
  return !isDeepSeekV4Model(modelId);
}

function buildChatPayload({ modelId, messages, maxTokens, temperature, stream }) {
  const payload = {
    model: modelId,
    messages,
    max_tokens: maxTokens,
    temperature,
    stream,
  };

  if (isDeepSeekV4Model(modelId)) {
    payload.chat_template_kwargs = {
      enable_thinking: true,
      thinking: true,
    };
  }

  return payload;
}

export async function chatCompletion({
  messages,
  model,
  maxTokens = 1024,
  temperature = 0.2,
  stream = false,
  timeoutMs = NVIDIA_FETCH_TIMEOUT_MS,
}) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  const baseUrl = process.env.NVIDIA_API_BASE_URL || DEFAULT_BASE_URL;
  const modelId = model || process.env.NVIDIA_MODEL || DEFAULT_TEXT_MODEL;

  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        buildChatPayload({ modelId, messages, maxTokens, temperature, stream })
      ),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw error;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errorBody}`);
  }

  if (stream) {
    return response.body;
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;
  const content =
    message?.content ||
    message?.reasoning_content ||
    message?.reasoning ||
    "";

  if (!content) {
    throw new Error("NVIDIA API returned an empty response");
  }

  return content;
}

export async function* streamChatCompletion(options) {
  const body = await chatCompletion({ ...options, stream: true });
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") {
        return;
      }
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta;
        const text =
          delta?.content ||
          delta?.reasoning_content ||
          delta?.reasoning ||
          "";
        if (text) {
          yield text;
        }
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export async function tryNvidiaAdvisorCompletion(messages) {
  const configured = process.env.NVIDIA_MODEL || DEFAULT_TEXT_MODEL;
  const models = [
    ...(isDeepSeekV4Model(configured) ? [] : [configured]),
    ...ADVISOR_MODEL_FALLBACKS,
  ].filter((model, index, all) => model && all.indexOf(model) === index);

  for (const model of models) {
    try {
      const raw = await chatCompletion({
        messages,
        model,
        maxTokens: 512,
        temperature: 0.4,
        timeoutMs: 12_000,
      });
      return raw;
    } catch {
      // try next model
    }
  }

  return null;
}

export async function chatWithText(prompt, options = {}) {
  return chatCompletion({
    messages: [{ role: "user", content: prompt }],
    ...options,
  });
}

export async function chatWithImage({ prompt, base64Data, mimeType, options = {} }) {
  const visionModel =
    options.model || process.env.NVIDIA_VISION_MODEL || DEFAULT_VISION_MODEL;

  return chatCompletion({
    model: visionModel,
    maxTokens: options.maxTokens ?? 1024,
    temperature: options.temperature ?? 0.2,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          },
        ],
      },
    ],
  });
}

export function parseJsonFromModelResponse(text) {
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(cleanedText);
}
