const VK_API_URL = "https://api.vk.com/method/messages.send"
const VK_API_VERSION = "5.199"

// TODO: найди peer_id беседы (2000000000 + chat_id) и вставь вместо 0.
// Env-переменная VK_PEER_ID переопределяет это значение.
const PEER_ID = 0

export type SignupPayload = {
  fio: string
  group: string
  topic: string
  contacts: string
}

export type SendResult = { ok: true } | { ok: false; error: string }

export function sanitize(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 2000) : ""
}

export function validateSignup(body: unknown): SignupPayload | null {
  const b = (body ?? {}) as Partial<SignupPayload>
  const payload: SignupPayload = {
    fio: sanitize(b.fio),
    group: sanitize(b.group),
    topic: sanitize(b.topic),
    contacts: sanitize(b.contacts),
  }
  if (!payload.fio || !payload.group || !payload.topic || !payload.contacts) return null
  return payload
}

export function formatMessage(data: SignupPayload): string {
  return [
    "📋 Новая заявка в СНК",
    "",
    `👤 ФИО: ${data.fio}`,
    `🎓 Группа: ${data.group}`,
    `🔬 Предполагаемая тема: ${data.topic}`,
    `📞 Контакты: ${data.contacts}`,
  ].join("\n")
}

async function sendToVk(token: string, peerId: number, message: string): Promise<SendResult> {
  const params = new URLSearchParams({
    access_token: token,
    peer_id: String(peerId),
    random_id: String(Math.round(Math.random() * 2 ** 28) + Date.now()),
    message,
    v: VK_API_VERSION,
    dont_parse_links: "1",
  })

  const response = await fetch(`${VK_API_URL}?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
  const json: unknown = await response.json().catch(() => null)

  if (!json) {
    return { ok: false, error: "Пустой ответ от VK API" }
  }
  const payload = json as { error?: { error_msg?: string }; response?: unknown }
  if (payload.error?.error_msg) {
    return { ok: false, error: payload.error.error_msg }
  }
  if (!("response" in payload)) {
    return { ok: false, error: "Некорректный ответ от VK API" }
  }
  return { ok: true }
}

export async function sendSignup(
  env: { VK_BOT_TOKEN?: string; VK_PEER_ID?: string },
  data: SignupPayload,
): Promise<SendResult> {
  const token = env.VK_BOT_TOKEN
  if (!token) {
    return { ok: false, error: "VK_BOT_TOKEN не задан" }
  }

  const peerId = Number(env.VK_PEER_ID ?? 0) || PEER_ID
  if (!peerId) {
    return { ok: false, error: "VK_PEER_ID не задан" }
  }

  return sendToVk(token, peerId, formatMessage(data))
}
