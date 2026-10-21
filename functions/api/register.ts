import { validateSignup, sendSignup } from "../../lib/vk"

type PagesEnv = {
  VK_BOT_TOKEN?: string
  VK_PEER_ID?: string
}

type PagesContext = {
  request: Request
  env: PagesEnv
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  let body: unknown = null
  try {
    body = await context.request.json()
  } catch {
    body = null
  }

  const data = validateSignup(body)
  if (!data) {
    return json({ ok: false, error: "Заполните все поля" }, 400)
  }

  const result = await sendSignup(context.env, data)
  return json(result, result.ok ? 200 : 502)
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  if (context.request.method !== "POST") {
    return json({ ok: false, error: "Метод не поддерживается" }, 405)
  }
  return onRequestPost(context)
}
