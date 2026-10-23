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

const TOPIC_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "I. Общая гистология",
    items: [
      "1. История и современные методы гистологических исследований: От световой микроскопии до электронной и конфокальной лазерной микроскопии.",
      "2. Гистохимия и иммуногистохимия (ИГХ): Как «окрасить» белки и почему это важно для диагностики (на примере онкомаркеров).",
      "3. Цитология в деталях: Современные представления о строении и функциях органелл. Роль цитоскелета в патологиях.",
      "4. Жизненный цикл клетки и его нарушения: Апоптоз vs Некроз. Морфологические признаки клеточной смерти.",
      "5. Эпителиальные ткани: Морфофункциональная характеристика. Барьерная и секреторная функции. Регенерация эпителия.",
      "6. Кровь как ткань: Гемограмма и лейкоцитарная формула в норме и при патологии. Морфология клеток крови при лейкозах.",
      "7. Соединительные ткани: Рыхлая и плотная волокнистая соединительная ткань. Роль фибробластов и макрофагов в заживлении ран.",
      "8. Хрящевая и костная ткани: Гистогенез, рост и ремоделирование кости. Клеточные механизмы остеопороза.",
      "9. Мышечные ткани: Сравнительная характеристика гладкой, скелетной и сердечной мышц. Механизмы гипертрофии и гиперплазии.",
      "10. Нервная ткань: Нейроглия и её роль. Регенерация нервных волокон: почему ЦНС не восстанавливается?",
    ],
  },
  {
    label: "II. Частная гистология",
    items: [
      "11. Гистофизиология кожи и её производных: Роль стволовых клеток в обновлении эпидермиса. Морфология ожогов и ран.",
      "12. Эндокринная система: Гипоталамо-гипофизарная система. Морфологические изменения щитовидной железы при зобе.",
      "13. Пищеварительная система (передний и средний отделы): Клеточный состав желез желудка и кишечника. Гистологические основы язвенной болезни.",
      "14. Печень и поджелудочная железа: Морфология гепатоцитов. Гистологические маркеры цирроза и панкреатита.",
      "15. Дыхательная система: Сурфактантная система легких. Морфология бронхиальной астмы и эмфиземы.",
      "16. Сердечно-сосудистая система: Микроциркуляторное русло. Морфологические аспекты атеросклероза и инфаркта миокарда.",
      "17. Органы кроветворения и иммунной защиты: Тимус и лимфатические узлы. Клеточные кооперации в иммунном ответе.",
      "18. Мочевыделительная система: Гистофизиология нефрона. Морфология острой и хронической почечной недостаточности.",
      "19. Мужская и женская половые системы: Сперматогенез и оогенез. Гистологические аспекты бесплодия и гормональной контрацепции.",
      "20. Органы чувств: Морфология сетчатки и органа слуха. Клеточные механизмы восприятия света и звука.",
    ],
  },
]

function SelectField({
  label,
  value,
  onChange,
  groups,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  groups: { label: string; items: string[] }[]
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...style,
          cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B6575' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.875rem center",
          paddingRight: "2.25rem",
        }}
      >
        <option value="">— Выберите тему —</option>
        {groups.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.items.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}

export default function SignupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [topic, setTopic] = useState("")
  const [fio, setFio] = useState("")
  const [group, setGroup] = useState("")
  const [teacher, setTeacher] = useState("")
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
      const url = import.meta.env.VITE_API_BASE || "/api/register"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, fio, group, teacher }),
      })
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Не удалось отправить заявку")
        setStatus("error")
        return
      }
      setStatus("success")
      setTopic("")
      setFio("")
      setGroup("")
      setTeacher("")
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
                  <SelectField label="Тема" value={topic} onChange={setTopic} groups={TOPIC_GROUPS} />
                  <Field label="ФИО" value={fio} onChange={setFio} placeholder="Иванов Иван Иванович" />
                  <Field label="Номер группы" value={group} onChange={setGroup} placeholder="23-102" />
                  <Field label="Научный руководитель" value={teacher} onChange={setTeacher} placeholder="Например: Темиров Б.А." />

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