import { CREW, STAGE_W } from '../data/crew'
import type { CrewId } from '../data/crew'
import { SpriteRuns } from './PixelSprite'

const STRIPES = Array.from({ length: 23 }, (_, i) => i)

/** Vertical seats sit on a shallow arc so the row reads as a half-oval table. */
const SEAT_TOP = 66
function arcDrop(index: number) {
  const half = (CREW.length - 1) / 2
  const t = Math.abs((index - half) / half)
  return 14 * Math.pow(t, 1.6)
}

/**
 * The room is two SVG layers so the whiteboard can sit on the back wall:
 * background (wall, decor, floor) beneath it, foreground (chairs, crew, table)
 * above it, with the board's HTML surface z-indexed between them.
 */
export function RoomBack() {
  return (
    <svg
      className="stage-svg stage-back"
      viewBox={`0 0 ${STAGE_W} 220`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="lampGlow" cx="50%" cy="0%" r="75%">
          <stop offset="0%" stopColor="#ffe6a8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffe6a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tableTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b98458" />
          <stop offset="55%" stopColor="#ad764d" />
          <stop offset="100%" stopColor="#7d5033" />
        </linearGradient>
        <linearGradient id="tableEdge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4229" />
          <stop offset="100%" stopColor="#4a2d1c" />
        </linearGradient>
      </defs>

      {/* wall */}
      <rect x="0" y="0" width={STAGE_W} height="112" fill="#223049" />
      {STRIPES.map((i) => (
        <rect key={i} x={i * 24 + 8} y="0" width="2" height="112" fill="#26354f" />
      ))}
      <rect x="0" y="0" width={STAGE_W} height="6" fill="#1a2439" />
      <rect x="0" y="105" width={STAGE_W} height="7" fill="#1a2439" />
      <rect x="0" y="105" width={STAGE_W} height="2" fill="#2e3d5c" />

      {/* framed chart */}
      <g>
        <rect x="26" y="18" width="46" height="32" fill="#0f1626" />
        <rect x="29" y="21" width="40" height="26" fill="#182238" />
        <rect x="33" y="34" width="5" height="11" fill="#3dd6c0" />
        <rect x="41" y="30" width="5" height="15" fill="#f2b03d" />
        <rect x="49" y="26" width="5" height="19" fill="#e4572e" />
        <rect x="57" y="33" width="5" height="12" fill="#6b8fd6" />
        <rect x="33" y="24" width="14" height="1" fill="#48577a" />
      </g>

      {/* wall clock */}
      <g>
        <rect x="474" y="16" width="24" height="24" fill="#0f1626" />
        <rect x="477" y="19" width="18" height="18" fill="#e8e3d2" />
        <rect x="485" y="21" width="2" height="7" fill="#26354f" />
        <rect x="486" y="27" width="5" height="2" fill="#26354f" />
      </g>

      {/* pendant lamps */}
      <g>
        <rect x="196" y="0" width="2" height="14" fill="#0e1420" />
        <rect x="182" y="14" width="30" height="3" fill="#2d3a56" />
        <rect x="185" y="17" width="24" height="5" fill="#3a4768" />
        <rect x="191" y="22" width="12" height="2" fill="#f2b03d" />
        <polygon points="191,24 203,24 232,112 162,112" fill="url(#lampGlow)" opacity="0.26" />

        <rect x="340" y="0" width="2" height="11" fill="#0e1420" />
        <rect x="326" y="11" width="30" height="3" fill="#2d3a56" />
        <rect x="329" y="14" width="24" height="5" fill="#3a4768" />
        <rect x="335" y="19" width="12" height="2" fill="#f2b03d" />
        <polygon points="335,21 347,21 374,112 308,112" fill="url(#lampGlow)" opacity="0.22" />
      </g>

      {/* floor */}
      <rect x="0" y="112" width={STAGE_W} height="108" fill="#151c2b" />
      {[124, 140, 158, 178, 200].map((y) => (
        <rect key={y} x="0" y={y} width={STAGE_W} height="1" fill="#1d2739" />
      ))}
      {[40, 160, 280, 400, 470].map((x) => (
        <rect key={x} x={x} y="184" width="34" height="1" fill="#1d2739" />
      ))}
    </svg>
  )
}

export function RoomFront({ activeCrew }: { activeCrew: CrewId | null }) {
  return (
    <svg
      className="stage-svg stage-front"
      viewBox={`0 0 ${STAGE_W} 220`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* chairs, seated on the half-oval arc */}
      {CREW.map((member, index) => {
        const active = activeCrew === member.id
        const top = SEAT_TOP - 16 + arcDrop(index)
        return (
          <g key={`chair-${member.id}`}>
            <rect x={member.seat - 22} y={top} width="44" height="60" fill="#0f1725" />
            <rect x={member.seat - 21} y={top + 1} width="42" height="58" fill="#253049" />
            <rect x={member.seat - 21} y={top + 1} width="42" height="4" fill="#33405e" />
            <rect x={member.seat - 21} y={top + 1} width="42" height="1" fill={active ? member.accent : '#3d4b6b'} />
            <rect x={member.seat - 18} y={top + 7} width="36" height="2" fill="#1b2437" />
            <rect x={member.seat - 24} y={top + 24} width="4" height="34" fill="#131a27" />
            <rect x={member.seat + 20} y={top + 24} width="4" height="34" fill="#131a27" />
          </g>
        )
      })}

      {/* crew */}
      {CREW.map((member, index) => (
        <svg
          key={member.id}
          x={member.seat - member.scale / 2}
          y={SEAT_TOP + arcDrop(index)}
          width={member.scale}
          height={member.scale}
          viewBox="0 0 20 20"
          className={`figure ${activeCrew === member.id ? 'figure-speaking' : ''}`}
          style={{ animationDelay: `${(index % 4) * 0.45}s` }}
          shapeRendering="crispEdges"
        >
          <SpriteRuns crew={member.id} />
        </svg>
      ))}

      {/* half-oval table, drawn over the crew so they sit behind it */}
      <g>
        <ellipse cx="268" cy="152" rx="252" ry="40" fill="url(#tableEdge)" />
        <ellipse cx="268" cy="146" rx="252" ry="38" fill="url(#tableTop)" />
        <ellipse cx="268" cy="140" rx="240" ry="30" fill="#b98458" opacity="0.55" />
        <ellipse cx="268" cy="138" rx="228" ry="26" fill="none" stroke="#c48f60" strokeWidth="1" opacity="0.6" />

        {/* grain */}
        <rect x="88" y="132" width="64" height="1" fill="#9a6742" />
        <rect x="246" y="146" width="96" height="1" fill="#9a6742" />
        <rect x="372" y="130" width="58" height="1" fill="#9a6742" />
        <rect x="150" y="156" width="44" height="1" fill="#7d5133" />
        <rect x="310" y="158" width="72" height="1" fill="#7d5133" />

        {/* mug */}
        <rect x="150" y="128" width="9" height="7" fill="#e8e3d2" />
        <rect x="150" y="128" width="9" height="2" fill="#b6b0a0" />
        <rect x="159" y="130" width="3" height="3" fill="#e8e3d2" />
        <rect x="153" y="130" width="3" height="2" fill="#5b3722" />

        {/* laptop */}
        <rect x="250" y="140" width="22" height="2" fill="#2b3752" />
        <rect x="252" y="142" width="18" height="9" fill="#1b2438" />
        <rect x="254" y="144" width="14" height="5" fill="#3dd6c0" opacity="0.75" />
        <rect x="253" y="152" width="16" height="1" fill="#4b5b7d" />

        {/* notebook */}
        <rect x="360" y="146" width="14" height="9" fill="#2c3a57" />
        <rect x="360" y="146" width="14" height="2" fill="#46577c" />
        <rect x="358" y="144" width="2" height="13" fill="#d9c36a" />
      </g>
    </svg>
  )
}
