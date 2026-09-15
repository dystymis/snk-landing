// TODO: найди peer_id беседы (2000000000 + chat_id) и вставь вместо 0.
// Либо задай env-переменную VK_PEER_ID на Vercel — она переопределит это значение.
const PEER_ID = 0

type VercelRequest = { method?: string; body?: unknown }
type VercelResponse = {
  status(code: number): { json(data: unknown): void }
}

const VK_API_URL = "https://api.vk.com/method/messages.send"
const VK_API_VERSION = "5.199"

type SignupPayload = {
  fio: string
  group: string
  topic: string
  contacts: string
}

function sanitize(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 2000) : ""
}

function formatMessage(data: SignupPayload): string {
  return [
    "📋 Новая заявка в СНК",
    "",
    `👤 ФИО: ${data.fio}`,
    `🎓 Группа: ${data.group}`,
    `🔬 Предполагаемая тема: ${data.topic}`,
    `📞 Контакты: ${data.contacts}`,
  ].join("\n")
}

async function sendToVk(token: string, peerId: number, message: string) {
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

  const errorData = json as { error?: { error_msg?: string }; response?: unknown } | null
  if (!json) {
    return { ok: false as const, error: "Пустой ответ от VK API" }
  }
  if ("error" in (json as object) && errorData?.error?.error_msg) {
    return { ok: false as const, error: errorData.error.error_msg }
  }
  if (!("response" in (json as object))) {
    return { ok: false as const, error: "Некорректный ответ от VK API" }
  }
  return { ok: true as const }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Метод не поддерживается" })
    return
  }

  const body = (req.body ?? {}) as Partial<SignupPayload>

  const fio = sanitize(body.fio)
  const group = sanitize(body.group)
  const topic = sanitize(body.topic)
  const contacts = sanitize(body.contacts)

  if (!fio || !group || !topic || !contacts) {
    res.status(400).json({ ok: false, error: "Заполните все поля" })
    return
  }

  const token = process.env.VK_BOT_TOKEN
  if (!token) {
    res.status(500).json({ ok: false, error: "VK_BOT_TOKEN не задан" })
    return
  }

  const peerId = Number(process.env.VK_PEER_ID ?? 0) || PEER_ID
  if (!peerId) {
    res.status(500).json({ ok: false, error: "VK_PEER_ID не задан" })
    return
  }

  const result = await sendToVk(token, peerId, formatMessage({ fio, group, topic, contacts }))

  res.status(result.ok ? 200 : 502).json(result)
}

export const config = {
  runtime: "nodejs",
}