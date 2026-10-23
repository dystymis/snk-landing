import { validateSignup, sendSignup } from "../lib/vk"

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

type YcEvent = {
  httpMethod?: string
  body?: string | null
  isBase64Encoded?: boolean
}

function json(statusCode: number, data: unknown) {
  return {
    statusCode,
    headers: { ...CORS, "Content-Type": "application/json" },
    isBase64Encoded: false,
    body: JSON.stringify(data),
  }
}

export const handler = async (event: YcEvent) => {
  const method = event.httpMethod

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS, isBase64Encoded: false, body: "" }
  }

  if (method !== "POST") {
    return json(405, { ok: false, error: "Метод не поддерживается" })
  }

  let parsed: unknown = null
  try {
    const raw =
      event.isBase64Encoded && event.body
        ? Buffer.from(event.body, "base64").toString("utf8")
        : (event.body ?? "")
    parsed = JSON.parse(raw)
  } catch {
    parsed = null
  }

  const data = validateSignup(parsed)
  if (!data) {
    return json(400, { ok: false, error: "Заполните все поля" })
  }

  const result = await sendSignup(
    { VK_BOT_TOKEN: process.env.VK_BOT_TOKEN, VK_PEER_ID: process.env.VK_PEER_ID },
    data,
  )

  return json(result.ok ? 200 : 502, result)
}
