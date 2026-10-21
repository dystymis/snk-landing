import * as SliderPrimitive from "@radix-ui/react-slider"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { useState, useEffect, useCallback, type ReactNode } from "react"

TooltipPrimitive.Provider

function TooltipContent({
  children, sideOffset = 4,
}: { children: ReactNode; sideOffset?: number }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        style={{
          zIndex: 50,
          borderRadius: 6,
          border: "1px solid rgba(82,82,91,0.5)",
          background: "#18181b",
          padding: "0.375rem 0.75rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#e4e4e7",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.04em",
        }}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

const MAG_MAP = [4, 40, 400] as const
type Mag = (typeof MAG_MAP)[number]

interface FocusKnobProps {
  mag: Mag
  onMagChange: (m: Mag) => void
}

export default function FocusKnob({ mag, onMagChange }: FocusKnobProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const sliderValue = MAG_MAP.indexOf(mag)
  const angle = sliderValue * 150 - 60

  const handleValueChange = (v: number[]) => {
    onMagChange(MAG_MAP[v[0]])
  }

  const handlePointerUp = useCallback(() => setShowTooltip(false), [])

  useEffect(() => {
    document.addEventListener("pointerup", handlePointerUp)
    return () => document.removeEventListener("pointerup", handlePointerUp)
  }, [handlePointerUp])

  return (
    <div style={{ position: "relative", width: 260, height: 260, flexShrink: 0 }}>
      {/* Knurled outer ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, #52525b 0deg, #3f3f46 2deg, #27272a 4deg, #3f3f46 6deg, #52525b 8deg)`,
          boxShadow: "0 25px 70px rgba(0,0,0,0.35), inset 0 0 40px rgba(0,0,0,0.5), inset 0 -4px 8px rgba(255,255,255,0.08)",
        }}
      >
        {Array.from({ length: 80 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transform: `rotate(${i * 4.5}deg)`,
              transformOrigin: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                width: "1px",
                height: 7,
                marginLeft: -0.5,
                background: "linear-gradient(to bottom, rgba(82,82,91,0.3), rgba(24,24,27,0.6))",
                boxShadow: "1px 0 1px rgba(255,255,255,0.15)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Metal body ring */}
      <div
        style={{
          position: "absolute",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3f3f46 0%, #27272a 50%, #18181b 100%)",
          width: 236,
          height: 236,
          top: 12,
          left: 12,
          boxShadow: "inset 0 6px 20px rgba(0,0,0,0.7), inset 0 -2px 8px rgba(255,255,255,0.04)",
        }}
      />

      {/* Main control surface */}
      <div
        style={{
          position: "absolute",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #27272a, #18181b, #09090b)",
          width: 214,
          height: 214,
          top: 23,
          left: 23,
          boxShadow: "inset 0 10px 25px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.4)",
        }}
      >
        {/* Brushed metal texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            opacity: 0.04,
            background: "repeating-conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.1) 0.5deg, transparent 1deg)",
          }}
        />

        {/* Grip ridges */}
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "1.5px",
              height: 32,
              background: "linear-gradient(to bottom, transparent, rgba(113,113,122,0.35), transparent)",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-58px)`,
              transformOrigin: "center",
              borderRadius: 1,
            }}
          />
        ))}

        {/* Position indicator marks */}
        {Array.from({ length: 36 }, (_, i) => {
          const markAngle = i * 10 - 60
          const isMajor = i % 6 === 0
          const radius = 98
          const x = Math.cos((markAngle * Math.PI) / 180) * radius
          const y = Math.sin((markAngle * Math.PI) / 180) * radius
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: isMajor ? 2 : 1,
                height: isMajor ? 10 : 6,
                background: isMajor
                  ? "linear-gradient(to bottom, #a1a1aa, #71717a)"
                  : "#52525b",
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%) rotate(${markAngle + 90}deg)`,
                boxShadow: isMajor ? "0 0 4px rgba(161,161,170,0.2)" : "none",
              }}
            />
          )
        })}

        {/* Center hub */}
        <div
          style={{
            position: "absolute",
            borderRadius: "50%",
            width: 64,
            height: 64,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle at 40% 40%, #52525b, #3f3f46, #27272a)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.7), inset 0 3px 8px rgba(255,255,255,0.08), inset 0 -3px 8px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 4,
              borderRadius: "50%",
              background: "radial-gradient(circle at 45% 45%, #3f3f46, #27272a, #18181b)",
              boxShadow: "inset 0 4px 12px rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "relative", width: 20, height: 20 }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "#52525b",
                  transform: "translateY(-50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: "#52525b",
                  transform: "translateX(-50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 3,
                  borderRadius: "50%",
                  border: "2px solid #52525b",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Red position indicator */}
        <div
          style={{
            position: "absolute",
            width: 3,
            height: 14,
            left: "50%",
            top: 12,
            transform: "translateX(-50%)",
            background: "linear-gradient(to bottom, #ef4444, #dc2626)",
            boxShadow: "0 0 8px rgba(239,68,68,0.6), 0 2px 4px rgba(0,0,0,0.5)",
            borderRadius: 1.5,
          }}
        />

        {/* Liquid glass cover effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            pointerEvents: "none",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06) 0%, transparent 55%)",
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* Rotating indicator ring */}
      <TooltipPrimitive.Provider>
        <div
          style={{
            position: "absolute",
            borderRadius: "50%",
            width: 260,
            height: 260,
            top: 0,
            left: 0,
            transform: `rotate(${angle}deg)`,
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "grab",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "radial-gradient(circle, #fbbf24, #f59e0b)",
              top: 6,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: "0 0 8px rgba(251,191,36,0.6), 0 2px 4px rgba(0,0,0,0.5)",
            }}
          />
        </div>

        <SliderPrimitive.Root
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "pointer",
          }}
          min={0}
          max={2}
          step={1}
          value={[sliderValue]}
          onValueChange={handleValueChange}
        >
          <SliderPrimitive.Track style={{ position: "relative", width: "100%", height: "100%" }}>
            <SliderPrimitive.Range style={{ position: "absolute" }} />
          </SliderPrimitive.Track>
          <TooltipPrimitive.Root open={showTooltip}>
            <TooltipPrimitive.Trigger asChild>
              <SliderPrimitive.Thumb
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  cursor: "grab",
                }}
                onPointerDown={() => setShowTooltip(true)}
              />
            </TooltipPrimitive.Trigger>
            <TooltipContent>×{mag}</TooltipContent>
          </TooltipPrimitive.Root>
        </SliderPrimitive.Root>
      </TooltipPrimitive.Provider>
    </div>
  )
}
