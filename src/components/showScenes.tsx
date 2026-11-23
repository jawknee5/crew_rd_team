import { useEffect, useState, type ReactNode } from 'react'
import { CREW, CREW_BY_ID, type CrewId } from '../data/crew'
import { crewSprite } from '../pixels/crewSprites'
import { BustSprite, SpriteRuns } from './PixelSprite'

/**
 * The four locations, drawn flat in the briefing-room palette:
 *
 *   Jerry & Dave's shared office  (green wall, twin desks, boombox, wall feeds)
 *   Dean's gym                    (blue wall, green floor, bench, BCX box desk)
 *   Clare's reception lobby       (red double doors, desk, secret floor hatch)
 *   Clarence's secret room        (hot tub, stage, disco ball, VIBE poster)
 *
 * They keep the same 536x220 board as the boardroom, so the resident sprite and
 * the fixed dialogue band drop straight in.
 */

const INK = '#0b0810'

function LairFrame({ children }: { children: ReactNode }) {
  return (
    <svg className="lair-svg" viewBox="0 0 536 220" shapeRendering="crispEdges" aria-hidden="true">
      {children}
    </svg>
  )
}

function Npc({ crew, x, y, size }: { crew: CrewId; x: number; y: number; size: number }) {
  const sprite = crewSprite(crew)
  const width = (size * sprite.w) / sprite.h
  return (
    <svg
      x={x + (size - width) / 2}
      y={y}
      width={width}
      height={size}
      viewBox={`0 0 ${sprite.w} ${sprite.h}`}
      shapeRendering="crispEdges"
    >
      <SpriteRuns crew={crew} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* 1. JERRY & DAVE'S SHARED OFFICE                                     */
/* ------------------------------------------------------------------ */

function OfficeScreen({ x, y, label = 'R&D' }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <rect x={x} y={y} width="56" height="38" fill={INK} />
      <rect x={x + 2} y={y + 2} width="52" height="30" fill="#d9c48e" />
      <rect x={x + 5} y={y + 5} width="40" height="20" fill="#173a1f" />
      <rect x={x + 7} y={y + 8} width="26" height="2" fill="#6af07a" opacity="0.8" />
      <rect x={x + 7} y={y + 12} width="34" height="1" fill="#6af07a" opacity="0.5" />
      <rect x={x + 7} y={y + 15} width="18" height="1" fill="#6af07a" opacity="0.4" />
      <text x={x + 30} y={y + 37} textAnchor="middle" fill="#3a2a10" fontSize="4" fontFamily="'Press Start 2P', monospace">
        {label}
      </text>
      <rect x={x + 22} y={y + 32} width="12" height="5" fill="#8a6a3a" />
      <rect x={x + 14} y={y + 37} width="28" height="2" fill={INK} />
    </g>
  )
}

function Boombox() {
  return (
    <g>
      <rect x="241" y="122" width="64" height="34" fill={INK} />
      <rect x="243" y="124" width="60" height="30" fill="#2a2a2a" />
      <rect x="246" y="127" width="16" height="18" fill="#6b6b6b" />
      <rect x="249" y="130" width="10" height="12" fill="#3a3a3a" />
      <rect x="284" y="127" width="16" height="18" fill="#6b6b6b" />
      <rect x="287" y="130" width="10" height="12" fill="#3a3a3a" />
      <rect x="265" y="127" width="16" height="14" fill="#1b2fa0" />
      <rect x="268" y="130" width="10" height="2" fill="#35c6c6" />
      <rect x="268" y="134" width="6" height="2" fill="#35c6c6" opacity="0.6" />
      <rect x="249" y="149" width="48" height="3" fill="#8a8a8a" />
      <rect x="270" y="116" width="2" height="7" fill="#b0b0b0" />
      <rect x="266" y="114" width="6" height="2" fill="#b0b0b0" />
    </g>
  )
}

export function ShowOffice({ crew }: { crew: 'milo' | 'stack' }) {
  const deskMate: CrewId = crew === 'milo' ? 'stack' : 'milo'
  return (
    <LairFrame>
      <rect x="0" y="0" width="536" height="220" fill="#8fc63d" />
      <rect x="0" y="0" width="536" height="9" fill="#6fa62a" />
      <rect x="0" y="146" width="536" height="6" fill="#1b3a6b" />
      <rect x="0" y="152" width="536" height="68" fill="#3f7fbf" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={`fl-${i}`} x="0" y={160 + i * 7} width="536" height="1" fill="#2f5f9f" opacity="0.55" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={`fs-${i}`} x={i * 47 + 10} y={i % 2 ? 152 : 160} width="1" height={i % 2 ? 8 : 7} fill="#2f5f9f" opacity="0.5" />
      ))}

      {/* wall feed boxes in the office's top-left corner */}
      <g>
        <rect x="12" y="17" width="102" height="24" fill={INK} />
        <rect x="14" y="19" width="98" height="20" fill="#2b2b2b" />
        <rect x="18" y="23" width="9" height="9" fill="#f2f2f2" />
        <rect x="20" y="25" width="5" height="5" fill="#2b2b2b" />
        <text x="33" y="31" fill="#f4f4f4" fontSize="5.6" fontFamily="'Press Start 2P', monospace">CREWNET</text>
        <rect x="14" y="45" width="98" height="20" fill="#2b2b2b" />
        <rect x="18" y="49" width="9" height="9" fill="#f2f2f2" />
        <rect x="20" y="51" width="5" height="5" fill="#2b2b2b" />
        <text x="33" y="58" fill="#f4f4f4" fontSize="5.6" fontFamily="'Press Start 2P', monospace">CREW PODCAST</text>
      </g>

      {/* framed coworker portrait */}
      <g>
        <rect x="128" y="18" width="52" height="62" fill={INK} />
        <rect x="132" y="22" width="44" height="54" fill="#c9302c" />
        <rect x="140" y="32" width="28" height="30" fill="#d9c48e" />
        <rect x="144" y="26" width="20" height="12" fill="#8a1f2a" />
        <rect x="144" y="38" width="4" height="2" fill={INK} />
        <rect x="158" y="38" width="4" height="2" fill={INK} />
        <rect x="146" y="50" width="16" height="2" fill={INK} />
        <rect x="136" y="66" width="36" height="5" fill="#8a5a30" />
      </g>

      {/* DAVE poster */}
      <g transform="rotate(2 420 52)">
        <rect x="386" y="16" width="66" height="78" fill={INK} />
        <rect x="390" y="20" width="58" height="70" fill="#d9c48e" />
        <rect x="400" y="28" width="38" height="30" fill="#e8662a" />
        <rect x="402" y="48" width="34" height="18" fill="#f2b47a" />
        <rect x="406" y="42" width="4" height="3" fill={INK} />
        <rect x="426" y="42" width="4" height="3" fill={INK} />
        <rect x="410" y="55" width="16" height="3" fill={INK} />
        <text x="419" y="81" textAnchor="middle" fill="#8a1f2a" fontSize="6" fontFamily="'Press Start 2P', monospace">DAVE</text>
      </g>

      {/* blue R&D plaque */}
      <g>
        <rect x="212" y="22" width="38" height="50" fill={INK} />
        <rect x="215" y="25" width="32" height="44" fill="#1b2fa0" />
        <rect x="219" y="30" width="24" height="5" fill="#f2d43d" />
        <rect x="219" y="38" width="18" height="3" fill="#35c6c6" />
        <rect x="219" y="44" width="24" height="2" fill="#f4f4f4" opacity="0.6" />
        <text x="231" y="62" textAnchor="middle" fill="#f4f4f4" fontSize="5" fontFamily="'Press Start 2P', monospace">R&amp;D</text>
      </g>

      {/* wall clock */}
      <g>
        <rect x="306" y="26" width="24" height="24" fill={INK} />
        <rect x="308" y="28" width="20" height="20" fill="#f4f4f4" />
        <rect x="317" y="32" width="2" height="8" fill={INK} />
        <rect x="318" y="38" width="6" height="2" fill={INK} />
      </g>

      {/* desk mate, seated behind the far desk */}
      <Npc crew={deskMate} x={crew === 'milo' ? 52 : 442} y={90} size={54} />

      {/* chairs */}
      <g>
        <rect x="18" y="126" width="42" height="8" fill="#7a2222" />
        <rect x="22" y="134" width="34" height="58" fill="#a83a32" />
        <rect x="26" y="140" width="26" height="46" fill="#7a2222" />
        <rect x="34" y="192" width="4" height="18" fill={INK} />
        <rect x="22" y="208" width="28" height="4" fill={INK} />
        <rect x="478" y="128" width="40" height="7" fill="#2a2a2a" />
        <rect x="482" y="135" width="32" height="56" fill="#3a3a3a" />
        <rect x="486" y="142" width="24" height="42" fill="#2a2a2a" />
        <rect x="496" y="190" width="4" height="18" fill={INK} />
        <rect x="484" y="206" width="28" height="4" fill={INK} />
      </g>

      {/* left desk: Dave's side */}
      <g>
        <polygon points="28,150 244,140 262,178 16,194" fill="#d9c48e" />
        <polygon points="16,194 262,178 262,202 16,218" fill="#a8874a" />
        <polygon points="16,194 28,150 34,152 22,196" fill="#8a6a3a" />
        <polygon points="16,202 262,186 262,190 16,206" fill="#8a6a3a" opacity="0.6" />
        <rect x="52" y="154" width="30" height="22" fill="#f4ecd4" stroke={INK} strokeWidth="1" transform="rotate(-3 52 154)" />
        <rect x="56" y="158" width="20" height="1" fill="#9a8a6a" />
        <rect x="56" y="161" width="14" height="1" fill="#9a8a6a" />
        <rect x="196" y="146" width="22" height="14" fill="#f4f4f4" stroke={INK} strokeWidth="1" />
        <rect x="199" y="149" width="16" height="2" fill="#8a8a8a" />
        <rect x="199" y="153" width="11" height="2" fill="#8a8a8a" />
        <OfficeScreen x={78} y={104} label="R&D" />
        <OfficeScreen x={150} y={108} label="R&D" />
        {/* checkered mat */}
        <g transform="rotate(-4 60 138)">
          <rect x="46" y="128" width="30" height="16" fill="#e8e8e8" />
          {Array.from({ length: 3 }, (_, ry) =>
            Array.from({ length: 4 }, (_, rx) => (
              <rect key={`cm-${rx}-${ry}`} x={46 + rx * 7.5} y={128 + ry * 5.3} width="7.5" height="5.3" fill={(rx + ry) % 2 ? '#3f8a3f' : '#f4f4f4'} />
            )),
          )}
        </g>
      </g>

      {/* right desk: Jerry's side */}
      <g>
        <polygon points="292,140 508,150 524,194 278,178" fill="#d9c48e" />
        <polygon points="278,178 524,194 524,218 278,202" fill="#a8874a" />
        <polygon points="508,150 524,194 518,196 502,152" fill="#8a6a3a" />
        <rect x="282" y="186" width="240" height="2" fill="#8a6a3a" opacity="0.6" />
        <rect x="312" y="150" width="26" height="16" fill="#f4ecd4" stroke={INK} strokeWidth="1" transform="rotate(3 312 150)" />
        <rect x="316" y="154" width="16" height="1" fill="#9a8a6a" />
        <OfficeScreen x={352} y={104} label="R&D" />
        <OfficeScreen x={424} y={110} label="R&D" />
        <g transform="rotate(4 330 142)">
          <rect x="316" y="132" width="28" height="16" fill="#e8e8e8" />
          {Array.from({ length: 3 }, (_, ry) =>
            Array.from({ length: 4 }, (_, rx) => (
              <rect key={`cm2-${rx}-${ry}`} x={316 + rx * 7} y={132 + ry * 5.3} width="7" height="5.3" fill={(rx + ry) % 2 ? '#3f8a3f' : '#f4f4f4'} />
            )),
          )}
        </g>
        <rect x="456" y="156" width="12" height="14" fill="#c9302c" />
        <rect x="456" y="156" width="12" height="3" fill="#f2d43d" />
        <rect x="470" y="150" width="18" height="8" fill="#f4ecd4" transform="rotate(-8 470 150)" />

        {crew === 'stack' && (
          <g className="stack-desk-bong">
            <rect x="416" y="138" width="18" height="4" fill={INK} />
            <rect x="419" y="124" width="12" height="14" fill="#cfe8f0" opacity="0.9" />
            <rect x="421" y="132" width="8" height="6" fill="#3aa8d8" opacity="0.9" />
            <rect x="422" y="112" width="6" height="12" fill="#cfe8f0" opacity="0.9" />
            <rect x="420" y="108" width="10" height="4" fill="#8a5a30" />
            <rect x="429" y="118" width="5" height="7" fill="#8a5a30" />
            <rect x="430" y="116" width="3" height="2" fill="#3f8a3f" />
            <circle cx="431" cy="115" r="1.2" fill="#e23b2e" />
          </g>
        )}
      </g>

      <Boombox />

      {/* cable under the center seam */}
      <path d="M262 176 C 272 188, 280 188, 290 178" stroke="#1a1a1a" strokeWidth="2" fill="none" />
    </LairFrame>
  )
}

/* ------------------------------------------------------------------ */
/* 2. DEAN'S GYM                                                       */
/* ------------------------------------------------------------------ */

export function ShowGym() {
  return (
    <LairFrame>
      <rect x="0" y="0" width="536" height="220" fill="#2a6fa8" />
      <rect x="0" y="0" width="536" height="9" fill="#1f5a88" />
      <rect x="0" y="146" width="536" height="6" fill="#1b4a2a" />
      <rect x="0" y="152" width="536" height="68" fill="#3f8a3f" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={`gf-${i}`} x="0" y={160 + i * 8} width="536" height="1" fill="#2f6a2f" opacity="0.5" />
      ))}

      {/* blinds */}
      <g>
        <rect x="424" y="16" width="104" height="134" fill={INK} />
        <rect x="428" y="20" width="96" height="126" fill="#e8e8e8" />
        {Array.from({ length: 13 }, (_, i) => (
          <g key={`bl-${i}`}>
            <rect x="430" y={22 + i * 9.5} width="92" height="5" fill="#f8f8f8" />
            <rect x="430" y={27 + i * 9.5} width="92" height="2" fill="#b8b8b8" />
          </g>
        ))}
        <rect x="424" y="16" width="104" height="3" fill="#5a5a5a" />
      </g>

      {/* Limo Kholis poster */}
      <g>
        <rect x="214" y="12" width="96" height="80" fill={INK} />
        <rect x="218" y="16" width="88" height="72" fill="#d9d9d9" />
        <rect x="222" y="20" width="80" height="64" fill="#7a9ac8" />
        <text x="262" y="29" textAnchor="middle" fill="#f4f4f4" fontSize="5" fontFamily="'Press Start 2P', monospace">LIMO KHOLIS</text>
        <rect x="230" y="36" width="62" height="22" fill="#c9302c" />
        <rect x="236" y="40" width="22" height="18" fill="#f2b47a" />
        <rect x="262" y="42" width="22" height="16" fill="#d9c48e" />
        <rect x="240" y="46" width="3" height="3" fill={INK} />
        <rect x="236" y="34" width="16" height="8" fill="#6b3f1c" />
        <rect x="226" y="64" width="70" height="8" fill="#2a2a2a" />
        <rect x="230" y="66" width="20" height="4" fill="#f2d43d" />
        <rect x="256" y="66" width="10" height="4" fill="#f4f4f4" />
      </g>

      {/* wall clock / vent */}
      <g>
        <rect x="330" y="98" width="20" height="16" fill={INK} />
        <rect x="332" y="100" width="16" height="12" fill="#9a9a9a" />
        {Array.from({ length: 3 }, (_, i) => (
          <rect key={`v-${i}`} x="334" y={102 + i * 3} width="12" height="1" fill="#5a5a5a" />
        ))}
      </g>

      {/* weight bench + rack */}
      <g>
        <rect x="18" y="150" width="8" height="56" fill="#3a3a3a" />
        <rect x="74" y="150" width="8" height="56" fill="#3a3a3a" />
        <rect x="12" y="146" width="76" height="8" fill="#6b6b6b" />
        <rect x="22" y="154" width="4" height="28" fill="#9a9a9a" />
        <rect x="74" y="154" width="4" height="28" fill="#9a9a9a" />
        <g className="gym-bar-static">
          <rect x="12" y="128" width="6" height="42" fill="#5a5a5a" />
          <rect x="82" y="128" width="6" height="42" fill="#5a5a5a" />
          <circle cx="16" cy="138" r="13" fill="#1a1a1a" />
          <circle cx="16" cy="138" r="8" fill="#2a2a2a" />
          <circle cx="84" cy="138" r="13" fill="#1a1a1a" />
          <circle cx="84" cy="138" r="8" fill="#2a2a2a" />
          <rect x="14" y="136" width="72" height="3" fill="#9a9a9a" />
        </g>
        <rect x="18" y="170" width="64" height="18" fill="#2f6fa8" />
        <rect x="22" y="166" width="56" height="8" fill="#3a8ac8" />
        <rect x="22" y="188" width="6" height="18" fill="#6b6b6b" />
        <rect x="72" y="188" width="6" height="18" fill="#6b6b6b" />
        <rect x="16" y="204" width="20" height="4" fill={INK} />
        <rect x="64" y="204" width="20" height="4" fill={INK} />
      </g>

      {/* BCX refrigerator box, tipped on its side as Dean's desk */}
      <g>
        {/* open end and folded flaps */}
        <polygon points="242,148 266,139 266,164 242,174" fill="#3a2414" />
        <polygon points="246,150 264,143 264,161 246,168" fill="#1a1008" />
        <polygon points="238,146 266,136 268,143 242,154" fill="#c9a15a" stroke={INK} strokeWidth="2" />
        <polygon points="238,146 242,154 242,166 238,158" fill="#8a5a30" />
        <polygon points="436,140 458,151 458,176 436,164" fill="#8a5a30" stroke={INK} strokeWidth="2" />
        <polygon points="438,145 453,152 453,170 438,161" fill="#a87a4a" />

        {/* long front panel */}
        <rect x="266" y="142" width="172" height="68" fill={INK} />
        <rect x="270" y="146" width="164" height="60" fill="#a87a4a" />

        {/* the side of the fridge box becomes the desk surface */}
        <polygon points="262,140 440,140 454,153 276,153" fill="#c9a15a" stroke={INK} strokeWidth="2" />
        <polygon points="276,153 454,153 454,158 276,158" fill="#8a5a30" />

        {/* corrugation and packing tape */}
        <rect x="276" y="146" width="2" height="60" fill="#8a5a30" />
        <rect x="426" y="146" width="2" height="60" fill="#8a5a30" />
        <rect x="340" y="146" width="22" height="60" fill="#c9a15a" opacity="0.55" />
        <rect x="340" y="146" width="1" height="60" fill="#8a5a30" opacity="0.7" />
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={`corr-${i}`} x={282 + i * 3} y="146" width="1" height="60" fill="#8a5a30" opacity="0.35" />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={`corr2-${i}`} x={414 + i * 3} y="146" width="1" height="60" fill="#8a5a30" opacity="0.35" />
        ))}

        {/* printed labels and shipping marks */}
        <text x="304" y="170" fill="#4a2a14" fontSize="4.4" fontFamily="'Press Start 2P', monospace">REFRIGERATOR</text>
        <rect x="280" y="176" width="144" height="5" fill="#c9302c" />
        <text x="290" y="201" fill={INK} fontSize="14" fontFamily="'Press Start 2P', monospace">BCX</text>
        <text x="290" y="207" fill="#4a2a14" fontSize="3.6" fontFamily="'Press Start 2P', monospace">CARDBOARD</text>
        <rect x="384" y="160" width="38" height="24" fill="#f4ecd4" stroke={INK} strokeWidth="1" />
        <rect x="388" y="164" width="20" height="2" fill="#8a8a8a" />
        <rect x="388" y="168" width="28" height="1" fill="#8a8a8a" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={`bar-${i}`} x={388 + i * 4} y="172" width="1" height="8" fill={INK} />
        ))}
        <g transform="rotate(-8 394 190)">
          <rect x="380" y="184" width="40" height="12" fill="#f4ecd4" stroke="#c9302c" strokeWidth="2" />
          <text x="400" y="193" textAnchor="middle" fill="#c9302c" fontSize="4.2" fontFamily="'Press Start 2P', monospace">FRAGILE</text>
        </g>
        <g fill="#4a2a14">
          <polygon points="410,184 418,184 414,178" />
          <rect x="412" y="184" width="4" height="8" />
          <polygon points="410,198 418,198 414,204" />
          <rect x="412" y="192" width="4" height="8" />
        </g>

        {/* monitor sits on the cardboard surface */}
        <rect x="306" y="96" width="62" height="46" fill={INK} />
        <rect x="310" y="100" width="54" height="34" fill="#d9c48e" />
        <rect x="314" y="104" width="42" height="24" fill="#173a1f" />
        <rect x="317" y="108" width="26" height="2" fill="#6af07a" />
        <rect x="317" y="112" width="34" height="1" fill="#6af07a" opacity="0.6" />
        <text x="337" y="140" textAnchor="middle" fill="#3a2a10" fontSize="5" fontFamily="'Press Start 2P', monospace">BCX</text>
        <rect x="332" y="142" width="13" height="6" fill="#8a6a3a" />
        <rect x="324" y="148" width="30" height="2" fill={INK} />

        {/* keyboard, bottle, mouse, papers on top */}
        <polygon points="286,148 342,148 348,158 292,158" fill="#d9d9d9" stroke={INK} strokeWidth="1" />
        {Array.from({ length: 3 }, (_, r) => (
          <polygon
            key={`k-${r}`}
            points={`${292 + r * 1},${151 + r * 3} ${342 + r * 1},${151 + r * 3} ${343 + r * 1},${152 + r * 3} ${293 + r * 1},${152 + r * 3}`}
            fill="#8a8a8a"
          />
        ))}
        <rect x="364" y="134" width="10" height="20" fill="#2f8a3f" />
        <rect x="366" y="130" width="6" height="5" fill="#8ae06a" />
        <rect x="382" y="148" width="10" height="7" fill="#c9302c" />
        <rect x="396" y="142" width="16" height="10" fill="#f4ecd4" transform="rotate(7 396 142)" />
        <rect x="400" y="145" width="9" height="1" fill="#9a8a6a" />
      </g>

      {/* office chair */}
      <g>
        <rect x="410" y="146" width="36" height="7" fill="#2a2a2a" />
        <rect x="414" y="153" width="28" height="42" fill="#3a3a3a" />
        <rect x="418" y="160" width="20" height="28" fill="#2a2a2a" />
        <rect x="426" y="195" width="4" height="14" fill={INK} />
        <rect x="414" y="209" width="28" height="4" fill={INK} />
      </g>

      {/* green server cabinet */}
      <g>
        <rect x="440" y="150" width="72" height="56" fill={INK} />
        <rect x="444" y="154" width="64" height="48" fill="#1f5a2a" />
        <rect x="450" y="160" width="52" height="2" fill="#3f8a3f" />
        <rect x="450" y="166" width="36" height="2" fill="#3f8a3f" />
        <rect x="450" y="172" width="44" height="2" fill="#3f8a3f" />
        <rect x="494" y="160" width="6" height="6" fill="#e23b2e" className="lair-led" />
        <rect x="450" y="184" width="40" height="2" fill="#6af07a" opacity="0.6" />
        <rect x="450" y="190" width="26" height="2" fill="#6af07a" opacity="0.4" />
      </g>

      {/* gym mat */}
      <rect x="14" y="164" width="92" height="4" fill="#2f6a2f" opacity="0.6" />
    </LairFrame>
  )
}

/* ------------------------------------------------------------------ */
/* DEAN'S BENCH GAG                                                    */
/* ------------------------------------------------------------------ */

export function DeanBenchGag() {
  const [count, setCount] = useState(1)
  const [face, setFace] = useState<CrewId | null>(null)

  useEffect(() => {
    setCount(1)
    setFace(null)
    const tick = window.setInterval(() => setCount((n) => (n % 3) + 1), 600)
    const show = window.setTimeout(() => {
      const others = CREW.filter((member) => member.id !== 'rex')
      setFace(others[Math.floor(Math.random() * others.length)].id)
    }, 1650)
    const hide = window.setTimeout(() => setFace(null), 5600)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [])

  const faceMember = face ? CREW_BY_ID[face] : null

  return (
    <div className="dean-bench-gag">
      <div className="dean-count" role="status" aria-label={`Dean counts ${count}`}>
        {[1, 2, 3].map((number) => (
          <span key={number} className={count === number ? 'is-on' : ''}>
            {number}
          </span>
        ))}
      </div>

      <div className="dean-bar" aria-hidden="true">
        <svg viewBox="0 0 120 28" shapeRendering="crispEdges">
          <rect x="10" y="13" width="100" height="4" fill="#8a8a8a" />
          <rect x="10" y="13" width="100" height="1" fill="#d9d9d9" />
          <rect x="12" y="6" width="8" height="18" fill="#1a1a1a" />
          <rect x="14" y="8" width="4" height="14" fill="#3a3a3a" />
          <rect x="100" y="6" width="8" height="18" fill="#1a1a1a" />
          <rect x="102" y="8" width="4" height="14" fill="#3a3a3a" />
          <rect x="7" y="8" width="4" height="14" fill="#2a2a2a" />
          <rect x="109" y="8" width="4" height="14" fill="#2a2a2a" />
          <rect x="46" y="10" width="8" height="7" fill="#f2b47a" stroke={INK} strokeWidth="1" />
          <rect x="66" y="10" width="8" height="7" fill="#f2b47a" stroke={INK} strokeWidth="1" />
        </svg>
      </div>

      {faceMember && (
        <div className="dean-face-pop">
          <div className="dean-face-frame">
            <BustSprite crew={faceMember.id} />
          </div>
          <div className="dean-face-copy">
            <span className="dean-face-name">{faceMember.short}</span>
            <p>“He can only count up to 3.”</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 3. CLARE'S RECEPTION LOBBY                                          */
/* ------------------------------------------------------------------ */

export function ShowLobby() {
  return (
    <LairFrame>
      <rect x="0" y="0" width="536" height="220" fill="#6aa83f" />
      <rect x="0" y="0" width="536" height="9" fill="#4f8a2f" />
      <rect x="0" y="150" width="536" height="6" fill="#1b3a1b" />
      <rect x="0" y="156" width="536" height="64" fill="#a8b89a" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={`lf-${i}`} x="0" y={164 + i * 7} width="536" height="1" fill="#8a9a80" opacity="0.55" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={`ls-${i}`} x={i * 47 + 12} y={i % 2 ? 156 : 164} width="1" height={i % 2 ? 8 : 7} fill="#8a9a80" opacity="0.5" />
      ))}

      {/* red double doors */}
      <g>
        <rect x="214" y="34" width="132" height="140" fill={INK} />
        <rect x="218" y="38" width="124" height="132" fill="#c9302c" />
        <rect x="222" y="42" width="116" height="124" fill="#e8e8e8" />
        <rect x="228" y="48" width="48" height="82" fill="#4aa8c8" />
        <rect x="284" y="48" width="48" height="82" fill="#4aa8c8" />
        <rect x="228" y="48" width="48" height="12" fill="#a8e0f2" />
        <rect x="284" y="48" width="48" height="12" fill="#a8e0f2" />
        <rect x="234" y="66" width="2" height="46" fill="#e8f6fa" opacity="0.8" transform="rotate(24 234 66)" />
        <rect x="290" y="66" width="2" height="46" fill="#e8f6fa" opacity="0.8" transform="rotate(24 290 66)" />
        <rect x="246" y="60" width="20" height="56" fill="#2f7fa8" opacity="0.35" />
        <rect x="302" y="60" width="20" height="56" fill="#2f7fa8" opacity="0.35" />
        <rect x="278" y="48" width="4" height="82" fill="#c9302c" />
        <rect x="274" y="94" width="5" height="12" fill="#d9d9d9" />
        <rect x="282" y="94" width="5" height="12" fill="#d9d9d9" />
        <rect x="222" y="132" width="52" height="34" fill="#c9302c" />
        <rect x="284" y="132" width="52" height="34" fill="#c9302c" />
        <rect x="226" y="136" width="44" height="26" fill="#8a1f1f" />
        <rect x="288" y="136" width="44" height="26" fill="#8a1f1f" />
        {/* EXIT sign */}
        <rect x="258" y="20" width="42" height="14" fill={INK} />
        <rect x="260" y="22" width="38" height="10" fill="#1f5a2a" />
        <text x="279" y="30" textAnchor="middle" fill="#8ae06a" fontSize="5" fontFamily="'Press Start 2P', monospace">EXIT</text>
        <rect x="352" y="34" width="8" height="12" fill="#e23b2e" />
        <rect x="354" y="31" width="4" height="3" fill="#f4f4f4" />
      </g>

      {/* secret hatch in the floor */}
      <g>
        <rect x="244" y="174" width="94" height="38" fill={INK} />
        <rect x="250" y="179" width="82" height="28" fill="#2a2a2a" />
        <rect x="258" y="184" width="66" height="18" fill="#111111" />
        <ellipse cx="291" cy="193" rx="23" ry="7" fill="#d9a441" />
        <ellipse cx="291" cy="191" rx="18" ry="5" fill="#f2d46a" />
        <ellipse cx="291" cy="191" rx="10" ry="3" fill="#8a6a1a" />
        <rect x="286" y="180" width="10" height="3" fill="#8a8a8a" />
        <rect x="240" y="170" width="4" height="4" fill="#f2d43d" opacity="0.7" />
        <rect x="338" y="170" width="4" height="4" fill="#f2d43d" opacity="0.7" />
      </g>

      {/* reception desk */}
      <g>
        <rect x="14" y="132" width="164" height="12" fill={INK} />
        <rect x="18" y="136" width="160" height="10" fill="#d9c48e" />
        <rect x="18" y="146" width="160" height="40" fill="#7a2222" />
        <rect x="24" y="152" width="148" height="28" fill="#8f2a2a" />
        <rect x="24" y="152" width="148" height="3" fill="#a83a32" />
        <rect x="32" y="160" width="48" height="3" fill="#5a1212" />
        <rect x="32" y="168" width="36" height="3" fill="#5a1212" />
        <rect x="176" y="146" width="26" height="22" fill="#5a1212" />
        {/* computer + phone + papers */}
        <rect x="52" y="106" width="58" height="36" fill={INK} />
        <rect x="56" y="110" width="50" height="24" fill="#d9c48e" />
        <rect x="60" y="114" width="38" height="16" fill="#173a1f" />
        <rect x="63" y="117" width="24" height="2" fill="#6af07a" />
        <rect x="63" y="121" width="30" height="1" fill="#6af07a" opacity="0.6" />
        <rect x="78" y="140" width="10" height="5" fill="#8a6a3a" />
        <rect x="70" y="145" width="26" height="2" fill={INK} />
        <rect x="120" y="124" width="20" height="12" fill="#c9302c" />
        <rect x="124" y="120" width="12" height="6" fill="#e23b2e" />
        <rect x="148" y="128" width="8" height="5" fill="#1b2fa0" />
        <rect x="118" y="138" width="28" height="10" fill="#f4ecd4" transform="rotate(-5 118 138)" />
        <rect x="122" y="141" width="18" height="1" fill="#9a8a6a" />
        <rect x="122" y="144" width="12" height="1" fill="#9a8a6a" />
        <rect x="42" y="142" width="14" height="4" fill="#f2d43d" />
        <rect x="146" y="146" width="12" height="4" fill="#f4f4f4" />
      </g>

      {/* reception chair */}
      <g>
        <rect x="30" y="148" width="36" height="7" fill="#2a2a2a" />
        <rect x="34" y="155" width="28" height="40" fill="#3a3a3a" />
        <rect x="40" y="196" width="4" height="16" fill={INK} />
        <rect x="28" y="212" width="28" height="4" fill={INK} />
      </g>

      {/* wall map + bear + WILLY + R&D */}
      <g>
        <rect x="16" y="18" width="60" height="46" fill={INK} />
        <rect x="19" y="21" width="54" height="40" fill="#1f3f8a" />
        <rect x="22" y="24" width="22" height="14" fill="#3f8a3f" />
        <rect x="46" y="24" width="24" height="20" fill="#3f6a8a" />
        <rect x="22" y="42" width="40" height="14" fill="#2f6a3f" />
        <rect x="26" y="36" width="3" height="3" fill="#f2d43d" />
        <rect x="474" y="18" width="46" height="44" fill={INK} />
        <rect x="478" y="22" width="38" height="36" fill="#5a3a1f" />
        <rect x="486" y="26" width="22" height="16" fill="#8a5a30" />
        <rect x="482" y="44" width="30" height="10" fill="#c9a15a" />
        <rect x="516" y="70" width="20" height="14" fill="#d9a441" />
        <text x="526" y="79" textAnchor="middle" fill="#3a2010" fontSize="4" fontFamily="'Press Start 2P', monospace">WILLY</text>
        <rect x="506" y="18" width="26" height="20" fill={INK} />
        <rect x="508" y="20" width="22" height="16" fill="#e8662a" />
        <text x="519" y="31" textAnchor="middle" fill="#1a1208" fontSize="7" fontFamily="'Press Start 2P', monospace">R&amp;D</text>
        <rect x="86" y="30" width="30" height="24" fill={INK} />
        <rect x="89" y="33" width="24" height="18" fill="#f4ecd4" />
        <rect x="93" y="37" width="16" height="1" fill="#9a8a6a" />
        <rect x="93" y="41" width="12" height="1" fill="#9a8a6a" />
      </g>

      {/* Todd + Larrity at the doors */}
      <Npc crew="nia" x={332} y={106} size={50} />
      <Npc crew="catalyst" x={388} y={102} size={54} />

      {/* water cooler */}
      <g>
        <rect x="406" y="150" width="20" height="46" fill="#d9d9d9" />
        <rect x="408" y="156" width="16" height="18" fill="#a8e0f2" />
        <rect x="410" y="146" width="12" height="6" fill="#4aa8c8" />
        <rect x="410" y="192" width="12" height="4" fill="#8a8a8a" />
      </g>

      {/* table with cards and chips */}
      <g>
        <ellipse cx="476" cy="166" rx="44" ry="16" fill={INK} />
        <ellipse cx="476" cy="163" rx="40" ry="14" fill="#8a5a30" />
        <ellipse cx="476" cy="161" rx="34" ry="11" fill="#2f6a3f" />
        <rect x="462" y="154" width="12" height="16" fill="#f4f4f4" transform="rotate(-8 462 154)" />
        <rect x="476" y="156" width="10" height="14" fill="#c9302c" transform="rotate(8 476 156)" />
        <circle cx="456" cy="160" r="3" fill="#f2d43d" />
        <circle cx="494" cy="158" r="3" fill="#e23b2e" />
        <circle cx="486" cy="166" r="3" fill="#f4f4f4" />
        <rect x="440" y="176" width="4" height="24" fill="#5a3a1f" />
        <rect x="506" y="176" width="4" height="24" fill="#5a3a1f" />
      </g>
    </LairFrame>
  )
}

/* ------------------------------------------------------------------ */
/* 4. CLARENCE'S SECRET HOT-TUB ROOM                                   */
/* ------------------------------------------------------------------ */

export function DaveBongRitual({ x }: { x: number }) {
  return (
    <div
      className="dave-ritual"
      style={{ left: `calc(${x}% + var(--lair-sprite) * 0.24)` }}
      aria-hidden="true"
    >
      <svg className="dave-bong" viewBox="0 0 30 44" shapeRendering="crispEdges">
        <rect x="12" y="14" width="6" height="22" fill="#cfe8f0" opacity="0.92" />
        <rect x="13" y="30" width="4" height="6" fill="#3aa8d8" />
        <ellipse cx="15" cy="38" rx="8" ry="5" fill="#cfe8f0" opacity="0.9" stroke={INK} strokeWidth="1" />
        <ellipse cx="15" cy="39" rx="6" ry="3" fill="#3aa8d8" />
        <rect x="12" y="12" width="11" height="3" fill="#cfe8f0" stroke={INK} strokeWidth="1" />
        <rect x="22" y="15" width="5" height="7" fill="#8a5a30" />
        <rect x="23" y="13" width="3" height="2" fill="#3f8a3f" />
        <circle cx="24" cy="12" r="1.2" fill="#e23b2e" className="bong-cherry" />
        <circle cx="14" cy="34" r="1.2" fill="#f4f4f4" className="bong-bubble" />
        <circle cx="17" cy="31" r="1" fill="#f4f4f4" className="bong-bubble bong-bubble-2" />
        <circle cx="13" cy="28" r="1" fill="#f4f4f4" className="bong-bubble bong-bubble-3" />
        <rect x="11" y="36" width="8" height="4" fill="#f2b47a" stroke={INK} strokeWidth="1" />
        <rect x="13" y="38" width="2" height="2" fill="#d99a62" />
      </svg>
      <svg className="dave-smoke dave-smoke-1" viewBox="0 0 24 16" shapeRendering="crispEdges">
        <rect x="2" y="6" width="7" height="6" fill="#e8e8e8" opacity="0.85" />
        <rect x="7" y="2" width="8" height="8" fill="#f4f4f4" opacity="0.8" />
        <rect x="13" y="5" width="7" height="6" fill="#d8d8d8" opacity="0.7" />
        <rect x="16" y="1" width="4" height="4" fill="#f4f4f4" opacity="0.6" />
      </svg>
      <svg className="dave-smoke dave-smoke-2" viewBox="0 0 24 16" shapeRendering="crispEdges">
        <rect x="4" y="7" width="5" height="5" fill="#f4f4f4" opacity="0.75" />
        <rect x="8" y="3" width="9" height="7" fill="#d8d8d8" opacity="0.8" />
        <rect x="15" y="6" width="6" height="5" fill="#e8e8e8" opacity="0.65" />
      </svg>
      <svg className="dave-smoke dave-smoke-3" viewBox="0 0 24 16" shapeRendering="crispEdges">
        <rect x="1" y="8" width="6" height="5" fill="#e8e8e8" opacity="0.7" />
        <rect x="6" y="4" width="7" height="7" fill="#f4f4f4" opacity="0.8" />
        <rect x="13" y="7" width="8" height="5" fill="#d8d8d8" opacity="0.6" />
        <rect x="18" y="3" width="4" height="4" fill="#f4f4f4" opacity="0.5" />
      </svg>
    </div>
  )
}

export function ShowHotTub() {
  return (
    <LairFrame>
      <rect x="0" y="0" width="536" height="220" fill="#d98ac0" />
      <rect x="0" y="0" width="536" height="9" fill="#b06a9a" />
      <rect x="0" y="150" width="536" height="6" fill="#8a4a7a" />
      <rect x="0" y="156" width="536" height="64" fill="#a8c8d8" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={`hf-${i}`} x="0" y={164 + i * 7} width="536" height="1" fill="#8aa8b8" opacity="0.45" />
      ))}

      {/* curtain */}
      <g>
        <rect x="516" y="10" width="20" height="146" fill="#8a2a6a" />
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={`cur-${i}`} x={518 + i * 5} y="10" width="2" height="146" fill="#b03a8a" />
        ))}
        <rect x="512" y="8" width="24" height="4" fill={INK} />
      </g>

      {/* framed VIBE poster */}
      <g>
        <rect x="456" y="26" width="48" height="58" fill={INK} />
        <rect x="460" y="30" width="40" height="50" fill="#d9a441" />
        <rect x="464" y="34" width="32" height="38" fill="#f4ecd4" />
        <rect x="468" y="38" width="24" height="20" fill="#b03a8a" />
        <rect x="472" y="42" width="6" height="6" fill="#f2d43d" />
        <rect x="482" y="46" width="6" height="4" fill="#35c6c6" />
        <text x="480" y="67" textAnchor="middle" fill="#3a2010" fontSize="5" fontFamily="'Press Start 2P', monospace">VIBE</text>
      </g>

      {/* candles */}
      <g>
        <rect x="218" y="56" width="5" height="22" fill="#f4f4f4" />
        <rect x="218" y="52" width="5" height="4" fill="#f2d43d" />
        <polygon points="220,44 223,52 218,52" fill="#f2a52a" />
        <rect x="236" y="62" width="5" height="18" fill="#f4c8e0" />
        <rect x="236" y="58" width="5" height="4" fill="#f2d43d" />
        <polygon points="238,50 241,58 236,58" fill="#f2a52a" />
        <rect x="212" y="78" width="34" height="4" fill="#8a2a6a" />
      </g>

      {/* disco ball */}
      <g>
        <rect x="264" y="8" width="2" height="18" fill="#8a8a8a" />
        <circle cx="265" cy="36" r="19" fill={INK} />
        <circle cx="265" cy="36" r="16" fill="#c9c9d9" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2
          return <rect key={`db-${i}`} x={265 + Math.cos(a) * 8 - 2} y={36 + Math.sin(a) * 8 - 2} width="4" height="4" fill="#f4f4f4" opacity="0.8" />
        })}
        <rect x="261" y="31" width="8" height="10" fill="#8a8aa8" />
        <rect x="244" y="20" width="2" height="2" fill="#f2d43d" />
        <rect x="286" y="28" width="2" height="2" fill="#f2d43d" />
        <rect x="250" y="48" width="2" height="2" fill="#f4f4f4" />
      </g>

      {/* hot tub: wood rim, water, the guests in it, then the front body hides their legs */}
      <g>
        <ellipse cx="118" cy="136" rx="96" ry="30" fill={INK} />
        <ellipse cx="118" cy="136" rx="92" ry="26" fill="#8a5a30" />
        <ellipse cx="118" cy="137" rx="82" ry="21" fill="#3aa8d8" />
        <ellipse cx="118" cy="135" rx="74" ry="17" fill="#6ac8e8" />
        <ellipse cx="118" cy="133" rx="60" ry="12" fill="#8ae0f2" opacity="0.65" />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={`bub-${i}`} cx={52 + i * 16} cy={132 + (i % 3) * 5} r={2 + (i % 2)} fill="#f4f4f4" opacity="0.7" />
        ))}
        <rect x="108" y="118" width="20" height="8" fill="#f4f4f4" opacity="0.35" />
        <rect x="92" y="110" width="12" height="6" fill="#f4f4f4" opacity="0.25" />
        <rect x="58" y="114" width="10" height="6" fill="#f4f4f4" opacity="0.25" />

        <Npc crew="vera" x={58} y={94} size={52} />
        <Npc crew="wren" x={128} y={94} size={52} />

        <rect x="20" y="142" width="196" height="70" fill={INK} />
        <rect x="24" y="146" width="188" height="66" fill="#8a5a30" />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={`tub-${i}`} x={28 + i * 18} y="146" width="2" height="66" fill="#5a3418" />
        ))}
        <rect x="24" y="146" width="188" height="10" fill="#a87a4a" />
        <rect x="24" y="176" width="188" height="6" fill="#5a3418" />
        <rect x="24" y="198" width="188" height="6" fill="#5a3418" />
        <rect x="20" y="142" width="6" height="70" fill="#5a3418" />
        <rect x="210" y="142" width="6" height="70" fill="#5a3418" />
        <rect x="20" y="208" width="196" height="4" fill={INK} />
      </g>

      {/* stage + mic, clear of the performer at 70% */}
      <g>
        <rect x="346" y="176" width="158" height="38" fill={INK} />
        <rect x="350" y="172" width="150" height="10" fill="#8a5a30" />
        <rect x="354" y="182" width="142" height="26" fill="#6b3f1c" />
        <rect x="362" y="186" width="126" height="2" fill="#a87a4a" />
        <rect x="432" y="106" width="4" height="72" fill="#9a9a9a" />
        <rect x="426" y="100" width="16" height="10" fill="#2a2a2a" />
        <rect x="430" y="92" width="8" height="8" fill="#6b6b6b" />
        <rect x="424" y="174" width="20" height="4" fill="#3a3a3a" />
      </g>

      {/* drinks table at the edge of the stage */}
      <g>
        <rect x="460" y="150" width="66" height="9" fill={INK} />
        <rect x="464" y="146" width="58" height="7" fill="#8a5a30" />
        <rect x="468" y="153" width="5" height="26" fill="#5a3418" />
        <rect x="514" y="153" width="5" height="26" fill="#5a3418" />
        <rect x="470" y="128" width="8" height="18" fill="#f4f4f4" />
        <rect x="470" y="134" width="8" height="6" fill="#e0576b" />
        <rect x="484" y="132" width="10" height="14" fill="#f4f4f4" />
        <rect x="486" y="134" width="6" height="8" fill="#f2a52a" />
        <rect x="500" y="130" width="8" height="16" fill="#35c6c6" />
        <rect x="512" y="134" width="8" height="10" fill="#f4ecd4" />
        <rect x="514" y="130" width="4" height="4" fill="#c9302c" />
        <rect x="466" y="144" width="18" height="2" fill="#d9a441" />
      </g>

      {/* confetti */}
      {Array.from({ length: 14 }, (_, i) => (
        <rect
          key={`conf-${i}`}
          x={20 + ((i * 37) % 480)}
          y={30 + ((i * 23) % 80)}
          width="3"
          height="3"
          fill={['#f2d43d', '#f4f4f4', '#35c6c6', '#b03a8a'][i % 4]}
          opacity="0.7"
        />
      ))}
    </LairFrame>
  )
}
