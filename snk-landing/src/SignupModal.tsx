import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

const EOSIN = "#D4436A"
const DARK = "#1C1C2E"

type ModalState = "form" | "sending" | "success" | "error"

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.9375rem",
  color: "#1C1C2E",
  background: "#FFFFFF",
  border: "1px solid #D4D0D8",
  borderRadius: 8,
  padding: "0.6rem 0.875rem",
  outline: "none",
  marginTop: "0.3rem",
}

const focusStyle: React.CSSProperties = {
  borderColor: EOSIN,
  boxShadow: `0 0 0 3px ${EOSIN}26`,
}

function Field({
  label,
  value,
  onChange,
  textarea,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  textarea?: boolean
  placeholder?: string
}) {
  const [focused, setFocused] = useState(false)
  const style = { ...inputStyle, ...(focused ? focusStyle : {}) }
  return (
    <label style={{ display: "block" }}>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.75rem",
        fontWeight: 500,
        color: "#6B6575",
      }}>
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          rows={3}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...style, resize: "vertical", minHeight: 72 }}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={style}
        />
      )}
    </label>
  )
}

export default function SignupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fio, setFio] = useState("")
  const [group, setGroup] = useState("")
  const [topic, setTopic] = useState("")
  const [contacts, setContacts] = useState("")
  const [status, setStatus] = useState<ModalState>("form")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setStatus("form")
      setError("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    setError("")
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fio, group, topic, contacts }),
      })
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Не удалось отправить заявку")
        setStatus("error")
        return
      }
      setStatus("success")
      setFio("")
      setGroup("")
      setTopic("")
      setContacts("")
    } catch {
      setError("Сервер недоступен, попробуйте позже")
      setStatus("error")
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="none"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(28, 28, 46, 0.45)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Запись в кружок"
            style={{
              width: "100%",
              maxWidth: 440,
              maxHeight: "90dvh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: 12,
              padding: "clamp(1.25rem, 4vw, 2rem)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.25)",
              position: "relative",
            }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Закрыть"
              onClick={onClose}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #E8E5E0",
                background: "#FFFFFF",
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
                color: "#6B6575",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              ✕
            </button>

            {status === "form" || status === "sending" || status === "error" ? (
              <>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginRight: "2rem",
                }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: EOSIN,
                    display: "inline-block",
                    flexShrink: 0,
                  }} />
                  <h2 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: DARK,
                    margin: 0,
                  }}>
                    Запись в кружок
                  </h2>
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  color: "#6B6575",
                  margin: "0.5rem 0 1.25rem",
                }}>
                  Заполните анкету — мы свяжемся с вами.
                </p>

                {status === "error" && (
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.8125rem",
                    color: EOSIN,
                    background: `${EOSIN}0F`,
                    border: `1px solid ${EOSIN}33`,
                    borderRadius: 8,
                    padding: "0.5rem 0.75rem",
                    marginBottom: "0.875rem",
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.875rem" }}>
                  <Field label="ФИО" value={fio} onChange={setFio} placeholder="Иванов Иван Иванович" />
                  <Field label="Группа" value={group} onChange={setGroup} placeholder="101-м" />
                  <Field label="Предполагаемая тема работы" value={topic} onChange={setTopic} textarea placeholder="Например: особенности соединительной ткани..." />
                  <Field label="Контакты студента" value={contacts} onChange={setContacts} placeholder="VK / телефон / почта" />

                  <motion.button
                    type="submit"
                    disabled={status === "sending"}
                    whileHover={status === "sending" ? undefined : { scale: 1.02 }}
                    whileTap={status === "sending" ? undefined : { scale: 0.98 }}
                    style={{
                      marginTop: "0.25rem",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9375rem",
                      fontWeight: 500,
                      color: "#FFFFFF",
                      background: DARK,
                      border: "none",
                      borderRadius: 8,
                      padding: "0.875rem 2rem",
                      cursor: status === "sending" ? "default" : "pointer",
                      opacity: status === "sending" ? 0.7 : 1,
                    }}
                  >
                    {status === "sending" ? "Отправляем..." : "Отправить заявку"}
                  </motion.button>
                </form>
              </>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "1rem 0 0.25rem",
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: `${EOSIN}14`,
                  color: EOSIN,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  marginBottom: "0.875rem",
                }}>
                  ✓
                </div>
                <h2 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: DARK,
                  margin: 0,
                }}>
                  Заявка отправлена!
                </h2>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  color: "#6B6575",
                  margin: "0.5rem 0 1.25rem",
                  maxWidth: 300,
                }}>
                  Мы получили вашу анкету и скоро свяжемся с вами в беседе кружка.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: "#FFFFFF",
                    background: DARK,
                    border: "none",
                    borderRadius: 8,
                    padding: "0.75rem 2.5rem",
                    cursor: "pointer",
                  }}
                >
                  Готово
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}