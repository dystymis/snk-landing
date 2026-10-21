import { validateSignup, sendSignup } from "../lib/vk"

type VercelRequest = { method?: string; body?: unknown }
type VercelResponse = {
  status(code: number): { json(data: unknown): void }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Метод не поддерживается" })
    return
  }

  const data = validateSignup(req.body)
  if (!data) {
    res.status(400).json({ ok: false, error: "Заполните все поля" })
    return
  }

  const result = await sendSignup(
    { VK_BOT_TOKEN: process.env.VK_BOT_TOKEN, VK_PEER_ID: process.env.VK_PEER_ID },
    data,
  )

  res.status(result.ok ? 200 : 502).json(result)
}

export const config = {
  runtime: "nodejs",
}
