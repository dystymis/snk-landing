import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, useCallback, useState, useEffect } from "react"
import Lenis from "lenis"

const EOSIN = "#D4436A"


type Mag = 4 | 40 | 400
const MAG_IMGS: Record<Mag, string> = {
  4: "/images/specimen_x4.png",
  40: "/images/specimen_x40.png",
  400: "/images/specimen_x400.png",
}
const MAG_LABELS: Mag[] = [4, 40, 400]

function MicroscopeView() {
  const ref = useRef<HTMLDivElement>(null)
  const [mag, setMag] = useState<Mag>(40)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const smoothPx = useSpring(px, { stiffness: 40, damping: 20 })
  const smoothPy = useSpring(py, { stiffness: 40, damping: 20 })
  const parallaxX = useTransform(smoothPx, (v) => (v - 0.5) * -8)
  const parallaxY = useTransform(smoothPy, (v) => (v - 0.5) * -8)

  /* ─── Glass spring for chromatic effects ─── */
  const glassX = useSpring(0.5, { stiffness: 120, damping: 8 })
  const glassY = useSpring(0.5, { stiffness: 120, damping: 8 })

  const prevMagRef = useRef(mag)

  const handleSetMag = useCallback((m: Mag) => {
    prevMagRef.current = mag
    setMag(m)
  }, [mag])

  const handleMove = useCallback((e: React.PointerEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width
    const ny = (e.clientY - r.top) / r.height
    px.set(nx)
    py.set(ny)
    glassX.set(nx)
    glassY.set(ny)
  }, [px, py, glassX, glassY])

  const handleLeave = useCallback(() => {
    px.set(0.5)
    py.set(0.5)
    glassX.set(0.5)
    glassY.set(0.5)
  }, [px, py, glassX, glassY])

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1.5rem",
    }}>
      {/* ─── Microscope viewport ─── */}
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="microscope-viewport"
        style={{
          width: "min(34vw, 580px)",
          maxWidth: 580,
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          position: "relative",
          cursor: "none",
          overflow: "hidden",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        {/* Barrel shadow */}
        <div style={layer(0, "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.14) 100%)", -12)} />

        {/* Histology image — mega smooth crossfade with scale */}
        <AnimatePresence>
          <motion.div
            key={mag}
            style={{
              position: "absolute",
              inset: -12,
              backgroundImage: `url(${MAG_IMGS[mag]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              x: parallaxX,
              y: parallaxY,
            }}
            initial={{
              opacity: 0,
              scale: mag > prevMagRef.current ? 0.88 : 1.12,
            }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: mag > prevMagRef.current ? 1.12 : 0.88,
            }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </AnimatePresence>

        {/* Dark vignette — lens depth */}
        <div style={layer(2, "radial-gradient(circle, transparent 50%, rgba(0,0,0,0.35) 100%)")} />

        {/* Internal refraction (chromatic shift at edges) */}
        <motion.div
          style={{
            ...layer(4),
            borderRadius: "50%",
            boxShadow: useTransform(
              [glassX, glassY],
              ([x, y]: number[]) => `
                inset ${1 + (x - 0.5) * 3}px 0 6px rgba(212,67,106,${0.05 + Math.abs(x - 0.5) * 0.06}),
                inset ${-1 + (y - 0.5) * -3}px 0 6px rgba(91,44,143,${0.05 + Math.abs(y - 0.5) * 0.06})
              `,
            ),
          }}
        />

        {/* Aperture inner bright ring */}
        <div style={{
          ...layer(5),
          borderRadius: "50%",
          boxShadow: "inset 0 0 18px rgba(255,255,255,0.04), 0 0 4px rgba(255,255,255,0.02)",
          border: "0.5px solid rgba(255,255,255,0.06)",
        }} />

        {/* Eyepiece rim shadow */}
        <div style={{
          ...layer(5),
          borderRadius: "50%",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.18), inset 0 0 10px rgba(0,0,0,0.08)",
        }} />

        {/* Outer metallic ring */}
        <div style={{
          position: "absolute",
          top: -5, left: -5, right: -5, bottom: -5,
          borderRadius: "50%",
          border: "1.5px solid rgba(52,50,60,0.12)",
          boxShadow: "0 0 24px rgba(0,0,0,0.04)",
          pointerEvents: "none",
          zIndex: 6,
        }} />

        {/* Chromatic edge fringe — shifts with mouse */}
        <motion.div
          style={{
            ...layer(7),
            borderRadius: "50%",
            boxShadow: useTransform(
              [glassX, glassY],
              ([x, y]: number[]) => `
                ${1.5 + (x - 0.5) * 4}px 0 5px rgba(212,67,106,${0.04 + Math.abs(x - 0.5) * 0.06}),
                ${-1.5 + (y - 0.5) * -4}px 0 5px rgba(91,44,143,${0.04 + Math.abs(y - 0.5) * 0.06})
              `,
            ),
          }}
        />

        {/* Magnification label */}
        <div style={{
          position: "absolute",
          bottom: "10%",
          right: "16%",
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.625rem",
          fontWeight: 400,
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.35)",
          zIndex: 9,
          pointerEvents: "none",
        }}>
          ×{mag}
        </div>
      </motion.div>

      {/* ─── Magnification slider ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          width: "100%",
          maxWidth: 200,
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.6875rem",
          fontWeight: 500,
          color: "#8B3A62",
          letterSpacing: "0.04em",
        }}>
          {MAG_LABELS.map((m) => (
            <span
              key={m}
              onClick={() => handleSetMag(m)}
              style={{
                cursor: "pointer",
                opacity: mag === m ? 1 : 0.4,
                transition: "opacity 0.2s",
                userSelect: "none",
              }}
            >
              ×{m}
            </span>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={MAG_LABELS.indexOf(mag)}
          onChange={(e) => handleSetMag(MAG_LABELS[+e.target.value])}
          style={{
            width: "100%",
            height: 3,
            appearance: "none",
            WebkitAppearance: "none",
            background: `linear-gradient(to right, #D4436A ${(MAG_LABELS.indexOf(mag) / 2) * 100}%, #D4D0D8 ${(MAG_LABELS.indexOf(mag) / 2) * 100}%)`,
            borderRadius: 2,
            outline: "none",
            cursor: "pointer",
          }}
          onInput={(e) => {
            const pct = (+e.currentTarget.value / 2) * 100
            e.currentTarget.style.background = `linear-gradient(to right, #D4436A ${pct}%, #D4D0D8 ${pct}%)`
          }}
        />
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.625rem",
          color: "#B0ABB8",
          letterSpacing: "0.06em",
        }}>
          <span>Низкое</span>
          <span>Среднее</span>
          <span>Высокое</span>
        </div>
      </motion.div>
    </div>
  )
}

const layer = (z: number, bg?: string, inset?: number): React.CSSProperties => ({
  position: "absolute",
  inset: inset ?? 0,
  background: bg,
  pointerEvents: "none",
  zIndex: z,
})

const TITLE_LINES = ["Гистология —", "искусство видеть невидимое"]

function App() {
  const isSnapping = useRef(false)
  const lenisRef = useRef<Lenis | null>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const contactsRef = useRef<HTMLElement>(null)

  const scrollToAbout = useCallback(() => {
    if (lenisRef.current && aboutRef.current) {
      isSnapping.current = true
      lenisRef.current.scrollTo(aboutRef.current, {
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        onComplete: () => { isSnapping.current = false },
      })
    }
  }, [])

  const scrollToContacts = useCallback(() => {
    if (lenisRef.current && contactsRef.current) {
      isSnapping.current = true
      lenisRef.current.scrollTo(contactsRef.current, {
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        onComplete: () => { isSnapping.current = false },
      })
    }
  }, [])

  const scrollToHero = useCallback(() => {
    if (lenisRef.current) {
      isSnapping.current = true
      lenisRef.current.scrollTo(0, {
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        onComplete: () => { isSnapping.current = false },
      })
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = "hidden"

    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8,
    })
    lenisRef.current = lenis

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    const sections = document.querySelectorAll("section")

    lenis.on("scroll", (e: { velocity: number }) => {
      if (isSnapping.current || !sections.length) return
      if (Math.abs(e.velocity) < 0.3) {
        const scrollTop = lenis.scroll
        const viewH = window.innerHeight
        const targetIdx = Math.round(scrollTop / viewH)
        const clamped = Math.max(0, Math.min(targetIdx, sections.length - 1))
        const snapTo = clamped * viewH
        if (Math.abs(scrollTop - snapTo) > 5) {
          isSnapping.current = true
          lenis.scrollTo(snapTo, {
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            onComplete: () => { isSnapping.current = false },
          })
        }
      }
    })

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <>
    <section style={{
      position: "relative",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#FFFFFF",
      padding: "clamp(1.5rem, 4vw, 3rem)",
    }}>
      <div className="hero-container" style={{
        position: "relative",
        maxWidth: 1280,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "clamp(2rem, 4vw, 5rem)",
      }}>
        <div className="hero-text" style={{
          flex: "1 1 480px",
          maxWidth: 560,
        }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: "1.5rem" }}
          >
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#6B6575",
              padding: "0.375rem 0.875rem",
              border: "1px solid #E8E5E0",
              borderRadius: 100,
            }}>
              <span style={{
                width: 5, height: 5,
                borderRadius: "50%",
                background: EOSIN,
                display: "inline-block",
              }} />
              Студенческий научный кружок
            </span>
          </motion.div>

          <h1 style={{
            fontFamily: "'Classico URW Bold', Georgia, serif",
            fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
            fontWeight: 600,
            textTransform: "uppercase",
            lineHeight: 1.08,
            color: "#1C1C2E",
            letterSpacing: "-0.025em",
            marginBottom: "1.25rem",
          }}>
            {TITLE_LINES.map((line, i) => (
              <motion.span
                key={i}
                style={{ display: "block" }}
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + i * 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.125rem",
              fontStyle: "italic",
              color: "#8B3A62",
              marginBottom: "1.25rem",
            }}
          >
            Медицинский университет «РеаВиЗ»
          </motion.p>

          <motion.p
            className="hero-desc"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "1rem",
              lineHeight: 1.75,
              color: "#5A5568",
              marginBottom: "2rem",
              maxWidth: 440,
            }}
          >
            Сообщество студентов, увлечённых наукой о тканях.
            Мы исследуем микроскопическое строение организма,
            проводим научные проекты и делимся знаниями.
          </motion.p>

          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                fontSize: "0.9375rem",
                fontWeight: 500,
                color: "#FFFFFF",
                background: "#1C1C2E",
                border: "none",
                borderRadius: 8,
                padding: "0.875rem 2rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                lineHeight: 1.4,
              }}
            >
              Записаться в кружок
              <span style={{
                display: "inline-block", fontSize: "1.1em", lineHeight: 1,
              }}>→</span>
            </motion.button>
          </motion.div>
        </div>

        <div className="hero-visual" style={{
          flex: "1 1 480px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <MicroscopeView />
        </div>
      </div>

      {/* Scroll-down button */}
      <div style={{
        position: "absolute",
        bottom: "clamp(1.5rem, 3vh, 2.5rem)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.35rem",
      }}>
        <button
          onClick={scrollToAbout}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid #D4D0D8",
            background: "#FFFFFF",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            transition: "opacity 0.2s, border-color 0.2s",
            opacity: 0.6,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "#8B3A62" }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.borderColor = "#D4D0D8" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: "block" }}>
            <path d="M7 1v10M3 7l4 4 4-4" stroke="#5A5568" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.625rem",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#8B3A62",
          opacity: 0.6,
        }}>
          О нас
        </span>
      </div>
    </section>

    {/* ─── About section ─── */}
    <section ref={aboutRef} style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#FFFFFF",
      padding: "clamp(2rem, 3vw, 3.5rem) clamp(2rem, 4vw, 5rem)",
    }}>
      <div style={{
        maxWidth: 820,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(0.75rem, 1.2vw, 1.25rem)",
        overflow: "auto",
      }}>
        {/* Logos */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "clamp(2rem, 5vw, 4rem)",
          flexShrink: 0,
        }}>
          <div style={{
            width: "clamp(90px, 16vw, 150px)",
            height: "clamp(90px, 16vw, 150px)",
            borderRadius: "50%",
            overflow: "hidden",
            border: "1px solid #D4D0D8",
            background: "#FAFAFA",
          }}>
            <img src="/images/СНК.jpg" alt="СНК" style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }} />
          </div>
          <div style={{
            width: "clamp(90px, 16vw, 150px)",
            height: "clamp(90px, 16vw, 150px)",
            borderRadius: "50%",
            overflow: "hidden",
            border: "1px solid #D4D0D8",
            background: "#FAFAFA",
          }}>
            <img src="/images/РВЗ.png" alt="РВЗ" style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }} />
          </div>
        </div>

        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.6875rem",
          fontWeight: 500,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#8B3A62",
          flexShrink: 0,
        }}>
          Студенческий научный кружок
        </span>

        <h2 style={{
          fontFamily: "'Classico URW Bold', Georgia, serif",
          fontSize: "clamp(1.15rem, 2.2vw, 1.6rem)",
          fontWeight: 600,
          lineHeight: 1.15,
          color: "#1C1C2E",
          textAlign: "center",
          maxWidth: 460,
          flexShrink: 0,
        }}>
          По гистологии
        </h2>

        <p style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "0.875rem",
          fontStyle: "italic",
          color: "#8B3A62",
          margin: 0,
          flexShrink: 0,
        }}>
          Медицинский университет «РеаВиЗ»
        </p>

        <div style={{
          width: "clamp(30px, 4vw, 50px)",
          height: 1,
          background: "#D4D0D8",
          flexShrink: 0,
        }} />

        {/* Leadership grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(1rem, 2vw, 2rem)",
          width: "100%",
          maxWidth: 560,
          flexShrink: 0,
        }}>
          <div>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.625rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8B3A62",
              display: "block",
              marginBottom: "0.35rem",
            }}>
              Научный руководитель
            </span>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8125rem",
              lineHeight: 1.5,
              color: "#1C1C2E",
              margin: 0,
              fontWeight: 500,
            }}>
              Темиров Бахром Абдусаломович
            </p>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              lineHeight: 1.4,
              color: "#6B6575",
              margin: "0.15rem 0 0 0",
            }}>
              Ассистент кафедры МиП
            </p>
          </div>
          <div>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.625rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8B3A62",
              display: "block",
              marginBottom: "0.35rem",
            }}>
              Староста
            </span>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8125rem",
              lineHeight: 1.5,
              color: "#1C1C2E",
              margin: 0,
              fontWeight: 500,
            }}>
              Наумов Андрей Сергеевич
            </p>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              lineHeight: 1.4,
              color: "#6B6575",
              margin: "0.15rem 0 0 0",
            }}>
              Группа 23-102
            </p>
          </div>
        </div>

        <div style={{
          width: "clamp(30px, 4vw, 50px)",
          height: 1,
          background: "#D4D0D8",
          flexShrink: 0,
        }} />

        {/* Activities */}
        <div style={{
          maxWidth: 560,
          width: "100%",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.625rem",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#8B3A62",
            display: "block",
            marginBottom: "0.625rem",
          }}>
            Направления работы
          </span>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}>
            {[
              "Обмен опытом между студентами",
              "Расширение кругозора в области гистологии",
              "Применение знаний на практических занятиях",
              "Научно-исследовательская работа и участие в конференциях",
              "Сотрудничество с другими студенческими кружками",
            ].map((item) => (
              <div key={item} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.8125rem",
                lineHeight: 1.5,
                color: "#5A5568",
              }}>
                <span style={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "#8B3A62",
                  flexShrink: 0,
                  marginTop: "0.5em",
                }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* VK link */}
        <a
          href="https://vk.com/snk_histology"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "#8B3A62",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            borderBottom: "1px solid transparent",
            transition: "border-color 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = "#8B3A62"}
          onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = "transparent"}
        >
          Группа ВКонтакте
          <span style={{ fontSize: "1.1em", lineHeight: 1, display: "inline-block" }}>→</span>
        </a>

        {/* Scroll-down button */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexShrink: 0,
        }}>
          <button
            onClick={scrollToContacts}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid #D4D0D8",
              background: "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              transition: "opacity 0.2s, border-color 0.2s",
              opacity: 0.5,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "#8B3A62" }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.borderColor = "#D4D0D8" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: "block" }}>
              <path d="M6 1v10M2 7l4 4 4-4" stroke="#5A5568" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.625rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8B3A62",
            opacity: 0.6,
          }}>
            Контакты
          </span>
        </div>
      </div>
    </section>

    {/* ─── Contacts section ─── */}
    <section ref={contactsRef} style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#FFFFFF",
      padding: "clamp(2rem, 3vw, 3.5rem) clamp(2rem, 4vw, 5rem)",
    }}>
      <div style={{
        maxWidth: 800,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(0.75rem, 1.2vw, 1.25rem)",
        overflow: "auto",
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.6875rem",
          fontWeight: 500,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#8B3A62",
          flexShrink: 0,
        }}>
          Контакты
        </span>

        <h2 style={{
          fontFamily: "'Classico URW Bold', Georgia, serif",
          fontSize: "clamp(1.15rem, 2.2vw, 1.6rem)",
          fontWeight: 600,
          lineHeight: 1.15,
          color: "#1C1C2E",
          textAlign: "center",
          maxWidth: 480,
          flexShrink: 0,
        }}>
          Студенческие научные кружки
        </h2>

        <div style={{
          width: "clamp(30px, 4vw, 50px)",
          height: 1,
          background: "#D4D0D8",
          flexShrink: 0,
        }} />

        {/* Links grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem clamp(1rem, 2vw, 2rem)",
          width: "100%",
          maxWidth: 680,
        }}>
          {[
            { name: "СНО Медицинского университета «Реавиз»", href: "https://vk.com/snoreaviz" },
            { name: "РЕАВИЗ СНК Внутренние болезни", href: "https://vk.com/reaviz_samara_snk_vb" },
            { name: "СНК медико-биологических дисциплин", href: "https://vk.com/medbio_reaviz" },
            { name: "СНК естественно-научных дисциплин", href: "https://vk.com/snk_end_reaviz" },
            { name: "СНК кафедры акушерства и гинекологии", href: "https://vk.com/club171597260" },
            { name: "СНК по онкологии и малоинвазивной хирургии", href: "https://vk.com/snk.reaviz_onkologia" },
            { name: "СНК по анатомии", href: "https://vk.com/anatomy_snk_reaviz" },
          ].map(({ name, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.8125rem",
                lineHeight: 1.5,
                color: "#5A5568",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.25rem 0",
                borderBottom: "1px solid transparent",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottomColor = "#D4D0D8"
                e.currentTarget.style.color = "#1C1C2E"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottomColor = "transparent"
                e.currentTarget.style.color = "#5A5568"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
                <rect width="36" height="36" rx="6" fill="#2787F5" />
                <path d="M18.97 25.5c-6.9 0-10.84-4.74-11-12.5h3.46c.1 5.03 2.31 7.16 4.07 7.6V13h3.46v4.34c1.74-.19 3.57-2.16 4.19-4.34h3.46c-.47 2.67-2.44 4.64-3.84 5.45 1.4.69 3.64 2.48 4.5 5.55h-3.57c-.67-2.09-2.34-3.7-4.54-3.93v3.93h-.42Z" fill="#fff" />
              </svg>
              <span>{name}</span>
            </a>
          ))}
        </div>

        <div style={{
          width: "clamp(30px, 4vw, 50px)",
          height: 1,
          background: "#D4D0D8",
          flexShrink: 0,
        }} />

        {/* Other resources */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.5rem clamp(1rem, 2vw, 2rem)",
          maxWidth: 680,
          width: "100%",
        }}>
          {[
            { name: "Официальный сайт", href: "https://www.reaviz.ru" },
            { name: "Газета университета", href: "https://totumverum.ru" },
            { name: "Клиники «Реавиз»", href: "https://reaviz.com" },
          ].map(({ name, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#6B6575",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.25rem 0",
                borderBottom: "1px solid transparent",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottomColor = "#D4D0D8"
                e.currentTarget.style.color = "#1C1C2E"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottomColor = "transparent"
                e.currentTarget.style.color = "#6B6575"
              }}
            >
              <span style={{ fontSize: "0.9em", opacity: 0.6 }}>↗</span>
              {name}
            </a>
          ))}
        </div>

        {/* Scroll-up button */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.625rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8B3A62",
            opacity: 0.6,
          }}>
            Наверх
          </span>
          <button
            onClick={scrollToHero}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid #D4D0D8",
              background: "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              transition: "opacity 0.2s, border-color 0.2s",
              opacity: 0.5,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "#8B3A62" }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.borderColor = "#D4D0D8" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: "block" }}>
              <path d="M6 11V1M10 5L6 1 2 5" stroke="#5A5568" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
    </>
  )
}

export default App
