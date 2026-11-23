import type { CrewId } from '../data/crew'
import { CREW, STAGE_W } from '../data/crew'
import { crewSprite } from '../pixels/crewSprites'
import { SpriteRuns } from './PixelSprite'

/**
 * The Crew R&D conference room: cream wallpaper over a dark wood wainscot, a
 * window full of trees, the blue presentation set on its cart, the marked-up
 * wall calendar, the brown office door and, in the corner, the urinal.
 *
 * The scene is a single flat 536x220 board. Depth comes from stepped pixel
 * shadows, the shallow arc of the chairs and the table painted over the cast,
 * so everybody reads as seated behind it.
 */

const WALL = '#e7d5a4'
const WALL_SHADE = '#d9c48e'
const WALL_LIGHT = '#f1e2b6'
const TRIM = '#5a351a'
const TRIM_DARK = '#38200f'
const TRIM_LIGHT = '#7d4d25'
const FLOOR = '#ab6d3b'
const FLOOR_DARK = '#8f5a2e'
const FLOOR_LIGHT = '#bd7d46'
const TABLE_TOP = '#8a4a28'
const TABLE_LIP = '#a86038'
const TABLE_FRONT = '#5a2c16'
const TABLE_DARK = '#3a1c0e'
const CHAIR = '#7a2222'
const CHAIR_DARK = '#4a1212'
const CHAIR_LIGHT = '#a83a32'
const BROWN = '#6b3f1c'
const BROWN_LIGHT = '#8a5a30'
const BROWN_DARK = '#3f2410'
const INK = '#0d0a08'

const SEAT_TOP = 72

/** A four-pixel bow: the centre of the table sits a touch higher. */
function arcDrop(seat: number) {
  const t = Math.min(1, Math.abs(seat - STAGE_W / 2) / (STAGE_W / 2))
  return 4 * Math.pow(t, 1.5)
}

function Wall() {
  return (
    <>
      <rect x="0" y="0" width={STAGE_W} height="113" fill={WALL} />
      {Array.from({ length: 21 }, (_, i) => (
        <rect key={`seam-${i}`} x={i * 26 + 13} y="10" width="1" height="78" fill={WALL_SHADE} opacity="0.55" />
      ))}
      <rect x="0" y="0" width={STAGE_W} height="10" fill={INK} />
      <rect x="0" y="10" width={STAGE_W} height="2" fill="#b89b5f" />

      {/* window: white frame, blue sky and the studio's token shrubbery */}
      <g>
        <rect x="6" y="14" width="102" height="72" fill={INK} />
        <rect x="9" y="17" width="96" height="66" fill="#f4eeda" />
        <rect x="14" y="22" width="86" height="56" fill="#78c8e8" />
        <rect x="14" y="22" width="86" height="12" fill="#a8e0f2" />
        <rect x="20" y="27" width="16" height="3" fill="#e8f6fa" />
        <rect x="23" y="30" width="10" height="2" fill="#e8f6fa" />
        {/* trees */}
        <rect x="24" y="44" width="9" height="22" fill="#3f8a3f" />
        <rect x="18" y="38" width="20" height="14" fill="#2f7a34" />
        <rect x="22" y="33" width="13" height="10" fill="#3f9a44" />
        <rect x="18" y="48" width="6" height="18" fill="#5a351a" />
        <rect x="30" y="50" width="3" height="16" fill="#6b4a2a" />
        <rect x="64" y="46" width="12" height="26" fill="#3f8a3f" />
        <rect x="58" y="38" width="24" height="16" fill="#2f7a34" />
        <rect x="62" y="34" width="15" height="11" fill="#4faa4a" />
        <rect x="69" y="52" width="4" height="20" fill="#5a351a" />
        <rect x="82" y="42" width="14" height="30" fill="#2f7a34" />
        <rect x="86" y="36" width="11" height="12" fill="#3f9a44" />
        {/* muntins + sill */}
        <rect x="55" y="22" width="4" height="56" fill="#f4eeda" />
        <rect x="14" y="46" width="86" height="3" fill="#f4eeda" />
        <rect x="4" y="84" width="106" height="5" fill="#d9cfa8" />
        <rect x="4" y="89" width="106" height="2" fill={INK} />
      </g>

      {/* framed cartridge poster */}
      <g>
        <rect x="112" y="24" width="38" height="42" fill={INK} />
        <rect x="115" y="27" width="32" height="36" fill="#1f2f7a" />
        <rect x="119" y="31" width="24" height="14" fill="#2f7a34" />
        <rect x="122" y="34" width="7" height="6" fill="#a8e06a" />
        <rect x="131" y="32" width="8" height="8" fill="#8ac04a" />
        <rect x="123" y="36" width="3" height="3" fill={INK} />
        <rect x="133" y="35" width="2" height="2" fill={INK} />
        <rect x="124" y="41" width="15" height="2" fill={INK} />
        <rect x="119" y="48" width="24" height="9" fill="#d9a441" />
        <rect x="121" y="51" width="20" height="2" fill={INK} />
        <rect x="121" y="54" width="13" height="1" fill={INK} />
        <rect x="116" y="27" width="2" height="36" fill="#35c6c6" />
      </g>

      {/* the conferencing cart under the screen */}
      <g>
        <rect x="178" y="64" width="204" height="4" fill="#d4cbb4" />
        <rect x="178" y="68" width="204" height="2" fill={INK} />
        <rect x="182" y="70" width="196" height="24" fill="#b5ac94" />
        <rect x="182" y="70" width="196" height="3" fill="#d4cbb4" />
        <rect x="238" y="71" width="84" height="18" fill="#2a2a2a" />
        <rect x="242" y="75" width="32" height="4" fill="#1b4a24" />
        <rect x="245" y="76" width="20" height="2" fill="#6af07a" />
        <rect x="242" y="82" width="20" height="2" fill="#6b6b6b" />
        <rect x="278" y="80" width="28" height="3" fill="#111111" />
        <rect x="310" y="74" width="5" height="5" fill="#d94a3d" />
        <rect x="318" y="74" width="5" height="5" fill="#d9a441" />
        <rect x="184" y="94" width="4" height="10" fill="#5a5a5a" />
        <rect x="372" y="94" width="4" height="10" fill="#5a5a5a" />
        <rect x="182" y="104" width="8" height="3" fill={INK} />
        <rect x="370" y="104" width="8" height="3" fill={INK} />
      </g>

      {/* wall calendar with the week crossed off */}
      <g>
        <rect x="380" y="20" width="40" height="45" fill={INK} />
        <rect x="382" y="22" width="36" height="41" fill="#f4eeda" />
        <rect x="382" y="22" width="36" height="7" fill="#c9302c" />
        <rect x="384" y="24" width="12" height="2" fill="#f4eeda" />
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={`cal-h-${i}`} x="382" y={33 + i * 6} width="36" height="1" fill="#baae92" />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={`cal-v-${i}`} x={386 + i * 7} y="29" width="1" height="34" fill="#baae92" />
        ))}
        {[
          [388, 35],
          [402, 36],
          [411, 35],
          [395, 42],
          [409, 42],
          [388, 48],
          [402, 54],
          [411, 48],
        ].map(([x, y], i) => (
          <g key={`x-${i}`}>
            <rect x={x} y={y} width="2" height="2" fill="#c9302c" />
            <rect x={x + 3} y={y} width="2" height="2" fill="#c9302c" />
            <rect x={x + 3} y={y + 2} width="2" height="2" fill="#c9302c" />
            <rect x={x} y={y + 2} width="2" height="2" fill="#c9302c" />
          </g>
        ))}
      </g>

      {/* brown office door */}
      <g>
        <rect x="426" y="16" width="90" height="96" fill={INK} />
        <rect x="430" y="20" width="82" height="92" fill="#4a2a14" />
        <rect x="435" y="24" width="72" height="84" fill="#7d5126" />
        <rect x="439" y="28" width="27" height="28" fill="#6b3f1c" />
        <rect x="441" y="30" width="23" height="24" fill="#8a5a30" />
        <rect x="471" y="28" width="32" height="50" fill="#6b3f1c" />
        <rect x="473" y="30" width="28" height="46" fill="#8a5a30" />
        <rect x="435" y="60" width="72" height="3" fill="#5a351a" />
        <rect x="496" y="64" width="7" height="6" fill="#d9a441" />
        <rect x="498" y="65" width="3" height="2" fill="#f2d46a" />
        <rect x="435" y="100" width="72" height="8" fill="#4a2a14" />
        <rect x="435" y="103" width="72" height="2" fill="#2a1408" />
        <rect x="452" y="42" width="17" height="11" fill="#f4eeda" />
        <rect x="454" y="44" width="13" height="1" fill="#3a2010" />
        <rect x="454" y="47" width="13" height="1" fill="#3a2010" />
        <rect x="454" y="50" width="9" height="1" fill="#3a2010" />
      </g>

      {/* brass CREW R&D plaque, tucked over the door head */}
      <g>
        <rect x="432" y="8" width="80" height="11" fill={INK} />
        <rect x="434" y="9" width="76" height="9" fill="#d9a441" />
        <rect x="435" y="10" width="74" height="2" fill="#f2d46a" />
        <text
          x="472"
          y="16.2"
          textAnchor="middle"
          fill="#3a2010"
          fontSize="4.4"
          fontFamily="'Press Start 2P', monospace"
        >
          CREW R&amp;D
        </text>
      </g>

      {/* back-right corner: wood, a MEN sign, the signature urinal */}
      <g>
        <rect x="514" y="16" width="22" height="97" fill={INK} />
        <rect x="516" y="18" width="20" height="95" fill={TRIM} />
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={`corner-${i}`} x={518 + i * 5} y="18" width="1" height="93" fill={TRIM_DARK} />
        ))}
        <rect x="518" y="21" width="16" height="8" fill="#f4eeda" />
        <rect x="518" y="21" width="16" height="1" fill={INK} />
        <rect x="518" y="28" width="16" height="1" fill={INK} />
        <text x="526" y="27.2" textAnchor="middle" fill="#3a2010" fontSize="5" fontFamily="'Press Start 2P', monospace">
          MEN
        </text>
        {/* flush pipe and valve */}
        <rect x="524" y="31" width="3" height="9" fill="#9a9a9a" />
        <rect x="520" y="39" width="12" height="6" fill={INK} />
        <rect x="521" y="40" width="10" height="4" fill="#e8e8e8" />
        {/* bowl */}
        <rect x="517" y="45" width="18" height="22" fill={INK} />
        <rect x="518" y="46" width="16" height="20" fill="#f4f4f4" />
        <rect x="520" y="48" width="12" height="15" fill="#d9d9d9" />
        <rect x="522" y="50" width="8" height="11" fill="#b8b8b8" />
        <rect x="524" y="58" width="4" height="2" fill={INK} />
        <rect x="519" y="48" width="2" height="15" fill="#ffffff" />
        <rect x="524" y="66" width="5" height="8" fill="#9a9a9a" />
        <rect x="517" y="44" width="18" height="2" fill="#c9c9c9" />
      </g>

      {/* chair rail, wood panel wainscot, baseboard */}
      <rect x="0" y="88" width={STAGE_W} height="3" fill={TRIM_LIGHT} />
      <rect x="0" y="91" width={STAGE_W} height="20" fill={TRIM} />
      {Array.from({ length: 19 }, (_, i) => (
        <g key={`panel-${i}`}>
          <rect x={i * 28 + 4} y="93" width="24" height="16" fill={TRIM_DARK} />
          <rect x={i * 28 + 5} y="94" width="22" height="14" fill={TRIM_LIGHT} />
          <rect x={i * 28 + 7} y="96" width="18" height="10" fill="#6b4224" />
        </g>
      ))}
      <rect x="0" y="111" width={STAGE_W} height="2" fill={INK} />

      {/* wood floor with a little depth under the table */}
      <rect x="0" y="113" width={STAGE_W} height="107" fill={FLOOR} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={`floor-h-${i}`} x="0" y={121 + i * 13} width={STAGE_W} height="1" fill={FLOOR_DARK} />
      ))}
      {Array.from({ length: 18 }, (_, i) => (
        <rect
          key={`floor-v-${i}`}
          x={i * 31 + 9}
          y={i % 2 ? 122 : 113}
          width="1"
          height={i % 2 ? 12 : 13}
          fill={FLOOR_LIGHT}
          opacity="0.7"
        />
      ))}
      <rect x="0" y="113" width={STAGE_W} height="3" fill={INK} />
    </>
  )
}

function Chair({ seat, active }: { seat: number; active: boolean }) {
  const top = 78 + arcDrop(seat)
  return (
    <g>
      <rect x={seat - 17} y={top} width="34" height="4" fill={INK} />
      <rect x={seat - 20} y={top + 3} width="40" height="43" fill={INK} />
      <rect x={seat - 18} y={top + 5} width="36" height="39" fill={CHAIR_DARK} />
      <rect x={seat - 17} y={top + 6} width="34" height="36" fill={CHAIR} />
      <rect x={seat - 17} y={top + 6} width="2" height="36" fill={CHAIR_LIGHT} />
      <rect x={seat + 15} y={top + 6} width="2" height="36" fill={CHAIR_DARK} />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={`stitch-${i}`}>
          <rect x={seat - 11 + i * 3} y={top + 12 + i * 2} width="3" height="2" fill={active ? CHAIR_LIGHT : '#93302a'} />
          <rect x={seat + 9 - i * 3} y={top + 12 + i * 2} width="3" height="2" fill={active ? CHAIR_LIGHT : '#93302a'} />
        </g>
      ))}
    </g>
  )
}

function BossChair() {
  return (
    <g>
      <rect x="0" y="63" width="60" height="5" fill={INK} />
      <rect x="2" y="66" width="56" height="5" fill={BROWN_DARK} />
      <rect x="0" y="70" width="60" height="49" fill={INK} />
      <rect x="3" y="71" width="54" height="46" fill={BROWN} />
      <rect x="7" y="75" width="46" height="39" fill={BROWN_LIGHT} />
      <rect x="7" y="75" width="46" height="3" fill="#a06a38" />
      <rect x="0" y="78" width="9" height="32" fill={INK} />
      <rect x="1" y="79" width="7" height="30" fill={BROWN_DARK} />
      <rect x="51" y="78" width="9" height="32" fill={INK} />
      <rect x="52" y="79" width="7" height="30" fill={BROWN_DARK} />
      {[
        [15, 83],
        [29, 81],
        [43, 83],
        [22, 93],
        [36, 93],
        [29, 104],
      ].map(([x, y], i) => (
        <rect key={`tuft-${i}`} x={x} y={y} width="3" height="3" fill={BROWN_DARK} />
      ))}
      <rect x="0" y="101" width="16" height="5" fill="#8a5a30" />
      <rect x="0" y="106" width="16" height="13" fill={BROWN_DARK} />
      <rect x="44" y="101" width="16" height="5" fill="#8a5a30" />
      <rect x="44" y="106" width="16" height="13" fill={BROWN_DARK} />
      <rect x="2" y="103" width="12" height="2" fill="#a06a38" />
      <rect x="46" y="103" width="12" height="2" fill="#a06a38" />
    </g>
  )
}

function Table() {
  return (
    <g transform="translate(0 4)">
      {/* the big boardroom slab, dark mahogany */}
      <rect x="8" y="104" width="528" height="4" fill={TABLE_DARK} />
      <rect x="8" y="107" width="528" height="4" fill={TABLE_LIP} />
      <rect x="8" y="110" width="528" height="22" fill={TABLE_TOP} />
      <rect x="8" y="110" width="528" height="3" fill="#c07a48" />
      <rect x="8" y="113" width="528" height="1" fill="#a86038" />
      <rect x="60" y="120" width="92" height="1" fill="#6b341a" />
      <rect x="240" y="126" width="120" height="1" fill="#6b341a" />
      <rect x="430" y="118" width="70" height="1" fill="#6b341a" />
      <rect x="8" y="131" width="528" height="3" fill={INK} />
      <rect x="8" y="134" width="528" height="50" fill={TABLE_FRONT} />
      <rect x="18" y="140" width="8" height="42" fill="#4a2211" />
      <rect x="510" y="140" width="8" height="42" fill="#4a2211" />
      <rect x="8" y="134" width="528" height="2" fill="#7a3f22" />
      <rect x="22" y="140" width="492" height="1" fill="#6b341a" />
      <rect x="22" y="170" width="492" height="1" fill="#4a2211" />
      <rect x="8" y="184" width="528" height="8" fill={TABLE_DARK} />
      <rect x="8" y="192" width="528" height="2" fill={INK} />
      <rect x="18" y="194" width="14" height="18" fill={TABLE_DARK} />
      <rect x="504" y="194" width="14" height="18" fill={TABLE_DARK} />
      <rect x="8" y="186" width="528" height="10" fill={INK} opacity="0.35" />

      {/* meeting junk from 1983 */}
      <g>
        {/* loose sheets left on the slab */}
        <g transform="rotate(-6 99 121)">
          <rect x="91" y="116" width="17" height="11" fill="#f4ecd4" stroke={INK} strokeWidth="1" />
          <rect x="94" y="119" width="11" height="1" fill="#b9a97a" />
          <rect x="94" y="122" width="8" height="1" fill="#b9a97a" />
        </g>
        <g transform="rotate(5 177 122)">
          <rect x="168" y="118" width="17" height="11" fill="#f4ecd4" stroke={INK} strokeWidth="1" />
          <rect x="171" y="121" width="11" height="1" fill="#b9a97a" />
          <rect x="171" y="124" width="7" height="1" fill="#b9a97a" />
        </g>
        <g transform="rotate(-4 265 120)">
          <rect x="256" y="115" width="17" height="11" fill="#f4ecd4" stroke={INK} strokeWidth="1" />
          <rect x="259" y="118" width="10" height="1" fill="#b9a97a" />
          <rect x="259" y="121" width="12" height="1" fill="#b9a97a" />
        </g>
        <g transform="rotate(6 348 123)">
          <rect x="340" y="118" width="17" height="11" fill="#f4ecd4" stroke={INK} strokeWidth="1" />
          <rect x="343" y="121" width="12" height="1" fill="#b9a97a" />
          <rect x="343" y="124" width="8" height="1" fill="#b9a97a" />
        </g>
        <g transform="rotate(-5 423 121)">
          <rect x="414" y="116" width="17" height="11" fill="#f4ecd4" stroke={INK} strokeWidth="1" />
          <rect x="417" y="119" width="10" height="1" fill="#b9a97a" />
          <rect x="417" y="122" width="12" height="1" fill="#b9a97a" />
        </g>
        <g transform="rotate(4 490 122)">
          <rect x="482" y="117" width="17" height="11" fill="#f4ecd4" stroke={INK} strokeWidth="1" />
          <rect x="485" y="120" width="11" height="1" fill="#b9a97a" />
          <rect x="485" y="123" width="7" height="1" fill="#b9a97a" />
        </g>
        {/* ashtray + cigarette */}
        <rect x="54" y="111" width="14" height="8" fill={INK} />
        <rect x="55" y="112" width="12" height="6" fill="#8a8a8a" />
        <rect x="57" y="113" width="8" height="3" fill="#6b6b6b" />
        <rect x="60" y="110" width="8" height="2" fill="#f2f2f2" />
        <rect x="67" y="110" width="2" height="2" fill="#d94a3d" />
        <rect x="70" y="108" width="1" height="1" fill="#b0b0b0" />
        {/* styrofoam cup */}
        <rect x="137" y="109" width="9" height="10" fill={INK} />
        <rect x="138" y="110" width="7" height="8" fill="#f4f4f4" />
        <rect x="138" y="111" width="7" height="2" fill="#c9302c" />
        <rect x="145" y="112" width="3" height="4" fill="#e8e8e8" />
        {/* legal pad */}
        <rect x="248" y="112" width="17" height="7" fill={INK} />
        <rect x="249" y="113" width="15" height="5" fill="#f2d43d" />
        <rect x="251" y="114" width="11" height="1" fill="#8a7a3a" />
        <rect x="251" y="116" width="8" height="1" fill="#8a7a3a" />
        {/* floppy disk */}
        <rect x="288" y="112" width="10" height="9" fill={INK} />
        <rect x="289" y="113" width="8" height="7" fill="#1b1b1b" />
        <rect x="291" y="113" width="4" height="3" fill="#9a9a9a" />
        <rect x="290" y="117" width="6" height="2" fill="#f4eeda" />
        {/* red soda can */}
        <rect x="374" y="109" width="7" height="11" fill={INK} />
        <rect x="375" y="110" width="5" height="9" fill="#c9302c" />
        <rect x="375" y="112" width="5" height="2" fill="#f2f2f2" />
        <rect x="376" y="109" width="4" height="1" fill="#d9d9d9" />
        {/* manila folder */}
        <rect x="444" y="112" width="19" height="7" fill={INK} />
        <rect x="445" y="113" width="17" height="5" fill="#c9a15a" />
        <rect x="447" y="111" width="7" height="2" fill="#c9a15a" />
        {/* cartridge stack */}
        <rect x="486" y="110" width="14" height="9" fill={INK} />
        <rect x="487" y="111" width="12" height="7" fill="#1f2f7a" />
        <rect x="489" y="113" width="8" height="3" fill="#35c6c6" />
        <rect x="489" y="117" width="8" height="1" fill="#d9a441" />
      </g>
    </g>
  )
}

export function RoomBack() {
  return (
    <svg
      className="stage-svg stage-back"
      viewBox={`0 0 ${STAGE_W} 220`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <Wall />
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
      {CREW.filter((member) => member.id !== 'catalyst').map((member) => (
        <Chair
          key={`chair-${member.id}`}
          seat={member.seat}
          active={activeCrew === member.id}
        />
      ))}
      <BossChair />

      {/* the cast sits behind the slab, so the table paints over their laps */}
      {CREW.map((member) => {
        const top = SEAT_TOP + arcDrop(member.seat)
        const active = activeCrew === member.id
        const sprite = crewSprite(member.id)
        // Full-body sprites are narrower than the old chibi; give them a little
        // more height in the seats, while Benny stays visibly smaller.
        const height = member.scale * (member.id === 'chip' ? 0.85 : 1.22)
        const width = (height * sprite.w) / sprite.h
        return (
          <svg
            key={member.id}
            x={member.seat - width / 2}
            y={top}
            width={width}
            height={height}
            viewBox={`0 0 ${sprite.w} ${sprite.h}`}
            className={`figure ${active ? 'figure-speaking' : ''}`}
            shapeRendering="crispEdges"
          >
            <SpriteRuns crew={member.id} />
            {active && (
              <g className="mouth-talk-layer">
                <SpriteRuns crew={member.id} talk />
              </g>
            )}
          </svg>
        )
      })}

      <Table />
    </svg>
  )
}
