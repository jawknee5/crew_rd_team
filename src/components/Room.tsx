import { CREW } from '../data/crew'
import type { CrewId } from '../data/crew'
import { FIGURE_TOP } from '../data/crew'
import { SpriteRuns } from './PixelSprite'

const STRIPES = Array.from({ length: 15 }, (_, i) => i)

export function Room({ activeCrew }: { activeCrew: CrewId | null }) {
  return (
    <svg className="stage-svg" viewBox="0 0 360 220" shapeRendering="crispEdges" aria-hidden="true">
      <defs>
        <radialGradient id="lampGlow" cx="50%" cy="0%" r="75%">
          <stop offset="0%" stopColor="#ffe6a8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffe6a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tableTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ad764d" />
          <stop offset="100%" stopColor="#8a5a3b" />
        </linearGradient>
      </defs>

      {/* wall */}
      <rect x="0" y="0" width="360" height="151" fill="#223049" />
      {STRIPES.map((i) => (
        <rect key={i} x={i * 24 + 8} y="0" width="2" height="151" fill="#26354f" />
      ))}
      <rect x="0" y="0" width="360" height="6" fill="#1a2439" />
      <rect x="0" y="144" width="360" height="7" fill="#1a2439" />
      <rect x="0" y="144" width="360" height="2" fill="#2e3d5c" />

      {/* framed chart */}
      <g>
        <rect x="22" y="26" width="54" height="42" fill="#0f1626" />
        <rect x="25" y="29" width="48" height="36" fill="#182238" />
        <rect x="29" y="46" width="7" height="15" fill="#3dd6c0" />
        <rect x="39" y="40" width="7" height="21" fill="#f2b03d" />
        <rect x="49" y="34" width="7" height="27" fill="#e4572e" />
        <rect x="59" y="44" width="7" height="17" fill="#6b8fd6" />
        <rect x="29" y="32" width="20" height="2" fill="#48577a" />
      </g>

      {/* wall clock */}
      <g>
        <rect x="292" y="22" width="30" height="30" fill="#0f1626" />
        <rect x="295" y="25" width="24" height="24" fill="#e8e3d2" />
        <rect x="306" y="28" width="2" height="9" fill="#26354f" />
        <rect x="307" y="36" width="7" height="2" fill="#26354f" />
        <rect x="305" y="24" width="4" height="2" fill="#8b99b1" />
      </g>

      {/* pendant lamps */}
      <g>
        <rect x="86" y="0" width="2" height="20" fill="#0e1420" />
        <rect x="70" y="20" width="34" height="3" fill="#2d3a56" />
        <rect x="73" y="23" width="28" height="6" fill="#3a4768" />
        <rect x="79" y="29" width="16" height="3" fill="#f2b03d" />
        <polygon points="79,32 95,32 128,151 46,151" fill="url(#lampGlow)" opacity="0.26" />

        <rect x="274" y="0" width="2" height="16" fill="#0e1420" />
        <rect x="258" y="16" width="34" height="3" fill="#2d3a56" />
        <rect x="261" y="19" width="28" height="6" fill="#3a4768" />
        <rect x="267" y="25" width="16" height="3" fill="#f2b03d" />
        <polygon points="267,28 283,28 314,151 236,151" fill="url(#lampGlow)" opacity="0.22" />
      </g>

      {/* floor */}
      <rect x="0" y="151" width="360" height="69" fill="#151c2b" />
      {[160, 171, 183, 196, 210].map((y) => (
        <rect key={y} x="0" y={y} width="360" height="1" fill="#1d2739" />
      ))}
      {[40, 120, 200, 280].map((x, i) => (
        <rect key={x} x={x} y={162 + i * 12} width="34" height="1" fill="#1d2739" />
      ))}

      {/* chairs */}
      {CREW.map((member) => {
        const active = activeCrew === member.id
        return (
          <g key={`chair-${member.id}`}>
            <rect x={member.seat - 26} y="75" width="52" height="59" fill="#0f1725" />
            <rect x={member.seat - 25} y="76" width="50" height="57" fill="#253049" />
            <rect x={member.seat - 25} y="76" width="50" height="4" fill="#33405e" />
            <rect x={member.seat - 25} y="76" width="50" height="1" fill={active ? member.accent : '#3d4b6b'} />
            <rect x={member.seat - 22} y="82" width="44" height="2" fill="#1b2437" />
            <rect x={member.seat - 28} y="100" width="4" height="34" fill="#131a27" />
            <rect x={member.seat + 24} y="100" width="4" height="34" fill="#131a27" />
          </g>
        )
      })}

      {/* crew */}
      {CREW.map((member, index) => (
        <svg
          key={member.id}
          x={member.seat - member.scale / 2}
          y={FIGURE_TOP}
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

      {/* table */}
      <g>
        <polygon points="40,151 320,151 350,198 10,198" fill="url(#tableTop)" />
        <polygon points="40,151 320,151 321,155 39,155" fill="#b98458" />
        <rect x="10" y="196" width="340" height="4" fill="#6b4229" />
        <rect x="10" y="200" width="340" height="12" fill="#5b3722" />
        <rect x="12" y="200" width="336" height="2" fill="#77492d" />
        <rect x="14" y="212" width="336" height="2" fill="#3f2416" />
        <rect x="26" y="214" width="16" height="6" fill="#3f2416" />
        <rect x="318" y="214" width="16" height="6" fill="#3f2416" />

        {/* grain */}
        <rect x="58" y="164" width="64" height="1" fill="#9a6742" />
        <rect x="150" y="176" width="96" height="1" fill="#9a6742" />
        <rect x="236" y="160" width="58" height="1" fill="#9a6742" />
        <rect x="86" y="188" width="44" height="1" fill="#7d5133" />
        <rect x="188" y="191" width="72" height="1" fill="#7d5133" />
        <rect x="34" y="172" width="30" height="1" fill="#7d5133" />

        {/* mug */}
        <rect x="124" y="168" width="10" height="8" fill="#e8e3d2" />
        <rect x="124" y="168" width="10" height="2" fill="#b6b0a0" />
        <rect x="134" y="170" width="3" height="4" fill="#e8e3d2" />
        <rect x="127" y="170" width="4" height="2" fill="#5b3722" />

        {/* laptop */}
        <rect x="172" y="170" width="22" height="2" fill="#2b3752" />
        <rect x="174" y="172" width="18" height="10" fill="#1b2438" />
        <rect x="176" y="174" width="14" height="6" fill="#3dd6c0" opacity="0.75" />
        <rect x="175" y="183" width="16" height="1" fill="#4b5b7d" />

        {/* notebook */}
        <rect x="232" y="176" width="14" height="10" fill="#2c3a57" />
        <rect x="232" y="176" width="14" height="2" fill="#46577c" />
        <rect x="230" y="174" width="2" height="14" fill="#d9c36a" />
      </g>
    </svg>
  )
}
