import type { CrewId } from '../data/crew'
import { ShowGym, ShowHotTub, ShowLobby, ShowOffice } from './showScenes'

export type LairIconName =
  | 'nacho'
  | 'bong'
  | 'pixie'
  | 'terminal'
  | 'gavel'
  | 'lightning'
  | 'browser'
  | 'cigar'
  | 'money'
  | 'magnifier'
  | 'stamp'
  | 'phone'
  | 'quill'
  | 'gear'
  | 'coffee'
  | 'flask'
  | 'joystick'
  | 'trophy'
  | 'paper'
  | 'pizza'
  | 'music'
  | 'cocktail'
  | 'barbell'

export type LairPose = 'stand' | 'sit' | 'crouch' | 'hover' | 'lift'

export interface LairAction {
  x: number
  pose: LairPose
  icon: LairIconName
  caption: string
}

export interface LairSpec {
  room: string
  wall: string
  wallDark: string
  floor: string
  floorDark: string
  accent: string
  lines: string[]
  actions: LairAction[]
}

/** Every seat gets a show-flavoured room, a looping bit and a fixed-size box. */
export const LAIRS: Record<CrewId, LairSpec> = {
  sable: {
    room: "SABLE'S RESEARCH DEN",
    wall: '#1b2436',
    wallDark: '#141c2b',
    floor: '#2a3242',
    floorDark: '#1f2634',
    accent: '#46d6c3',
    lines: [
      'The thread was deleted in 2014. I have the cache, the author, and the man he argued with.',
      'Two sources agree and one is lying. Give me a minute with the citations.',
      'This is not obscure. It is just buried under nine pages of search results nobody read.',
    ],
    actions: [
      { x: 68, pose: 'sit', icon: 'terminal', caption: 'DARK WEB INDEX' },
      { x: 30, pose: 'stand', icon: 'paper', caption: 'THREAD RECOVERED' },
      { x: 46, pose: 'stand', icon: 'magnifier', caption: 'SOURCE DISPUTED' },
      { x: 78, pose: 'sit', icon: 'coffee', caption: 'THIRD POT' },
    ],
  },
  vera: {
    room: "MARY'S QA LAB",
    wall: '#c9d8d0',
    wallDark: '#b4c4bb',
    floor: '#8f9a94',
    floorDark: '#78837d',
    accent: '#e0576b',
    lines: [
      'I ran it eleven times. It fails on the ninth, which is the only time it matters.',
      'The methodology is fine. The conclusion is doing push-ups on top of it.',
      'I am not negative. I am the reason the release notes are not a confession.',
    ],
    actions: [
      { x: 70, pose: 'sit', icon: 'terminal', caption: '17 FAILURES' },
      { x: 38, pose: 'stand', icon: 'stamp', caption: 'REJECTED' },
      { x: 24, pose: 'stand', icon: 'paper', caption: 'NULL IN ROW 4' },
      { x: 80, pose: 'stand', icon: 'coffee', caption: 'BISECTING' },
    ],
  },
  ines: {
    room: "CLARENCE'S SECRET ROOM",
    wall: '#d98ac0',
    wallDark: '#b06a9a',
    floor: '#a8c8d8',
    floorDark: '#8aa8b8',
    accent: '#b03fc0',
    lines: [
      'The soundtrack is the only thing holding this company together, and I have not slept since Tuesday.',
      'This room does not exist. If Larrity asks, we are in a meeting about audio compression.',
      'The hot tub is for acoustics. The bubbles are a reverb effect. Do not touch the martinis.',
    ],
    actions: [
      { x: 70, pose: 'stand', icon: 'music', caption: 'SOUNDTRACK' },
      { x: 28, pose: 'stand', icon: 'cocktail', caption: 'HOT TUB' },
      { x: 88, pose: 'stand', icon: 'coffee', caption: 'MARTINIS' },
      { x: 48, pose: 'stand', icon: 'lightning', caption: 'DISCO BALL' },
    ],
  },
  chip: {
    room: "BENNY'S BASEMENT",
    wall: '#4a4640',
    wallDark: '#3d3934',
    floor: '#3a3630',
    floorDark: '#2e2b26',
    accent: '#e23b2e',
    lines: [
      'Whole rig cost me nothing. The RAM came out of a printer that was still under warranty.',
      'It boots in four seconds because I deleted everything that was not the game.',
      'I beat it at lunch. It is not out yet. I am not going to explain that twice.',
    ],
    actions: [
      { x: 64, pose: 'crouch', icon: 'pixie', caption: 'PIXIE STIX' },
      { x: 30, pose: 'sit', icon: 'joystick', caption: 'HIGH SCORE' },
      { x: 82, pose: 'sit', icon: 'terminal', caption: 'SALVAGED RAM' },
      { x: 48, pose: 'stand', icon: 'pizza', caption: 'LUNCH, DAY 3' },
    ],
  },
  milo: {
    room: "JERRY & DAVE'S OFFICE",
    wall: '#8fc63d',
    wallDark: '#6fa62a',
    floor: '#3f7fbf',
    floorDark: '#2f5f9f',
    accent: '#4caf50',
    lines: [
      'I have written down every way this can fail. There are eleven, and you have chosen four.',
      'Dave, the build was due at nine. The boombox is not a build server, no matter what it says.',
      'I fixed it. You are welcome. I also wrote the test that proves I fixed it.',
    ],
    actions: [
      { x: 70, pose: 'sit', icon: 'terminal', caption: 'G4TV.COM' },
      { x: 34, pose: 'stand', icon: 'paper', caption: "DAVE'S MESS" },
      { x: 20, pose: 'stand', icon: 'gear', caption: 'ZERO BUGS' },
      { x: 82, pose: 'stand', icon: 'coffee', caption: 'NO SLEEP' },
    ],
  },
  rex: {
    room: "DEAN'S GYM",
    wall: '#2a6fa8',
    wallDark: '#1f5a88',
    floor: '#3f8a3f',
    floorDark: '#2f6a2f',
    accent: '#d92b2b',
    lines: [
      'Dad says I am in charge now. Dad also says not to touch the payroll spreadsheet.',
      'I approved the budget. I do not know what the budget is, but it is approved.',
      'The gym is for focus. The focus is for the budget. The budget is for Dad.',
    ],
    actions: [
      { x: 66, pose: 'sit', icon: 'phone', caption: 'CALLING DAD' },
      { x: 24, pose: 'stand', icon: 'trophy', caption: "DEAN'S GYM" },
      { x: 88, pose: 'stand', icon: 'money', caption: "DAD'S MONEY" },
      { x: 44, pose: 'stand', icon: 'stamp', caption: 'APPROVED' },
      { x: 10, pose: 'lift', icon: 'barbell', caption: 'BENCH PRESS' },
    ],
  },
  nia: {
    room: "TODD'S LAIR",
    wall: '#242444',
    wallDark: '#1b1b35',
    floor: '#3a2a4a',
    floorDark: '#2e203b',
    accent: '#5b6dc9',
    lines: [
      'I mapped the office as a dungeon. The break room is a save point. Clare is a boss fight.',
      'My mother and I are having a serious conversation about nachos. It is going well.',
      'Every room is a level. Every meeting is a cutscene. The payroll is a mimic.',
    ],
    actions: [
      { x: 62, pose: 'sit', icon: 'nacho', caption: 'MOM · NACHOS' },
      { x: 22, pose: 'stand', icon: 'joystick', caption: 'HIGH SCORE' },
      { x: 84, pose: 'sit', icon: 'phone', caption: 'ON THE PHONE' },
      { x: 44, pose: 'stand', icon: 'paper', caption: 'DUNGEON MAP' },
    ],
  },
  theo: {
    room: "THEO'S WRITING STUDY",
    wall: '#3a3026',
    wallDark: '#2f261e',
    floor: '#5a3f2a',
    floorDark: '#493220',
    accent: '#8aa8ff',
    lines: [
      'Six pages of argument, one page a stranger can act on. That is the whole job.',
      'The prompt was thirty lines. It should have been three. I fixed that.',
      'Nobody reads the caveats until the caveats become the story. So I lead with them.',
    ],
    actions: [
      { x: 66, pose: 'sit', icon: 'quill', caption: 'SIX PAGES' },
      { x: 28, pose: 'stand', icon: 'paper', caption: 'ONE PAGE LEFT' },
      { x: 80, pose: 'stand', icon: 'coffee', caption: 'THIRD POT' },
      { x: 46, pose: 'stand', icon: 'terminal', caption: 'PROMPT TRIMMED' },
    ],
  },
  catalyst: {
    room: "LARRITY'S EXECUTIVE SUITE",
    wall: '#2b3a2a',
    wallDark: '#22301f',
    floor: '#6b3f1c',
    floorDark: '#553218',
    accent: '#3fae4a',
    lines: [
      'I do not know what a renderer is, but I know it is costing me money.',
      'The hook is not the product. The hook is who the customer thinks they become.',
      'Make it human. Then make it loud. Then make it rich. In that order.',
    ],
    actions: [
      { x: 66, pose: 'sit', icon: 'cigar', caption: 'BIG T' },
      { x: 30, pose: 'stand', icon: 'money', caption: 'MAKE ME MONEY' },
      { x: 82, pose: 'stand', icon: 'phone', caption: 'BOARD CALL' },
      { x: 46, pose: 'stand', icon: 'trophy', caption: 'THE HOOK' },
    ],
  },
  stack: {
    room: "JERRY & DAVE'S OFFICE",
    wall: '#8fc63d',
    wallDark: '#6fa62a',
    floor: '#3f7fbf',
    floorDark: '#2f5f9f',
    accent: '#e4572e',
    lines: [
      'The renderer was fine. Somebody moved the renderer. I am not naming names, Jerry.',
      'This code is a personal insult and I am going to fix it at two in the morning.',
      'The bong is for focus. The focus is for the build. The build is for all of us.',
    ],
    actions: [
      { x: 70, pose: 'sit', icon: 'terminal', caption: 'SHIP IT' },
      { x: 76, pose: 'crouch', icon: 'bong', caption: 'MIND EXPANDER' },
      { x: 22, pose: 'stand', icon: 'pizza', caption: 'COLD PIZZA' },
      { x: 86, pose: 'stand', icon: 'gear', caption: 'ONE MORE BUILD' },
    ],
  },
  equalizer: {
    room: "BLACK STEVE'S LAW OFFICE",
    wall: '#2a3036',
    wallDark: '#21272c',
    floor: '#4a3626',
    floorDark: '#382a1d',
    accent: '#3fae4a',
    lines: [
      'Before I argue anything: jurisdiction, parties, timeline, and what you signed.',
      'They made a procedural mistake in March. It is now the only thing that matters.',
      'I am not your lawyer. I am the reason your lawyer is going to read every page.',
    ],
    actions: [
      { x: 68, pose: 'sit', icon: 'gavel', caption: 'SUSTAINED' },
      { x: 34, pose: 'stand', icon: 'paper', caption: 'CEASE & DESIST' },
      { x: 84, pose: 'stand', icon: 'phone', caption: 'INTAKE' },
      { x: 22, pose: 'stand', icon: 'money', caption: 'FOR THE PEOPLE' },
    ],
  },
  xortron: {
    room: "XORTRON'S SERVER VAULT",
    wall: '#1a1428',
    wallDark: '#120e1d',
    floor: '#241a36',
    floorDark: '#1a1228',
    accent: '#b06cff',
    lines: [
      'I have four solutions. Three are wrong. I know exactly which three, and I am not telling you yet.',
      'Your architecture is brave. Brave is a word people use before the outage.',
      'I ran the simulation for a thousand years. It agreed with me on the second one.',
    ],
    actions: [
      { x: 24, pose: 'hover', icon: 'gear', caption: 'OPTIMAL' },
      { x: 70, pose: 'stand', icon: 'terminal', caption: 'SELF-AWARE' },
      { x: 48, pose: 'hover', icon: 'lightning', caption: 'SURGE' },
      { x: 86, pose: 'stand', icon: 'paper', caption: 'FOUR SOLUTIONS' },
    ],
  },
  wren: {
    room: "CLARE'S RECEPTION",
    wall: '#6aa83f',
    wallDark: '#4f8a2f',
    floor: '#a8b89a',
    floorDark: '#8a9a80',
    accent: '#e0576b',
    lines: [
      'I run the desk, the doors, the calendar, and the only copy of the code. Sit down.',
      'The secret hatch is not a secret if you keep opening it in front of the investors.',
      'Todd and Larrity are in the lobby again. I am not paid enough to referee poker night.',
    ],
    actions: [
      { x: 18, pose: 'sit', icon: 'phone', caption: 'RECEPTION' },
      { x: 52, pose: 'stand', icon: 'magnifier', caption: 'SECRET DOOR' },
      { x: 86, pose: 'stand', icon: 'money', caption: 'POKER NIGHT' },
      { x: 70, pose: 'stand', icon: 'stamp', caption: 'LOBBY' },
    ],
  },
}

const INK = '#0b0810'

function Shell({
  spec,
  window: hasWindow = true,
}: {
  spec: LairSpec
  window?: boolean
}) {
  return (
    <>
      <rect x="0" y="0" width="536" height="220" fill={spec.wall} />
      {Array.from({ length: 17 }, (_, i) => (
        <rect key={`seam-${i}`} x={i * 34 + 12} y="8" width="1" height="108" fill={spec.wallDark} opacity="0.5" />
      ))}
      <rect x="0" y="0" width="536" height="8" fill={INK} />
      <rect x="0" y="8" width="536" height="2" fill={spec.wallDark} />
      {/* ceiling light */}
      <rect x="238" y="8" width="60" height="3" fill={INK} />
      <rect x="242" y="11" width="52" height="2" fill="#f2e6b0" />
      <polygon points="208,13 328,13 386,124 150,124" fill="#f2e6b0" opacity="0.06" />

      {hasWindow && (
        <g>
          <rect x="52" y="20" width="104" height="70" fill={INK} />
          <rect x="55" y="23" width="98" height="64" fill="#d9cfb4" />
          <rect x="60" y="28" width="88" height="54" fill="#78c8e8" />
          <rect x="60" y="28" width="88" height="11" fill="#a8e0f2" />
          <rect x="102" y="28" width="4" height="54" fill="#d9cfb4" />
          <rect x="60" y="52" width="88" height="3" fill="#d9cfb4" />
          <rect x="48" y="90" width="112" height="4" fill={spec.wallDark} />
          <rect x="48" y="94" width="112" height="2" fill={INK} />
        </g>
      )}

      <rect x="0" y="116" width="536" height="4" fill={spec.wallDark} />
      <rect x="0" y="120" width="536" height="5" fill={INK} />
      <rect x="0" y="125" width="536" height="95" fill={spec.floor} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={`plank-${i}`} x="0" y={132 + i * 12} width="536" height="1" fill={spec.floorDark} />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <rect
          key={`joint-${i}`}
          x={i * 40 + 14}
          y={i % 2 ? 125 : 133}
          width="1"
          height={i % 2 ? 7 : 12}
          fill={spec.floorDark}
          opacity="0.7"
        />
      ))}
      <rect x="0" y="125" width="536" height="2" fill={INK} opacity="0.5" />
      <rect x="0" y="216" width="536" height="4" fill={INK} opacity="0.4" />
    </>
  )
}

function Desk({
  x,
  y = 146,
  w = 116,
  h = 38,
  top = '#8a5a30',
  front = '#5a3418',
  trim = '#6b3f1c',
}: {
  x: number
  y?: number
  w?: number
  h?: number
  top?: string
  front?: string
  trim?: string
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={4} fill={INK} />
      <rect x={x + 2} y={y + 4} width={w - 4} height={5} fill={top} />
      <rect x={x + 2} y={y + 9} width={w - 4} height={h - 9} fill={front} />
      <rect x={x + 2} y={y + 9} width={w - 4} height={2} fill={trim} />
      <rect x={x + 8} y={y + 16} width={w - 16} height={2} fill={trim} opacity="0.7" />
      <rect x={x + 8} y={y + h - 4} width={w - 16} height={4} fill={INK} opacity="0.6" />
    </g>
  )
}

function Monitor({
  x,
  y = 108,
  w = 38,
  h = 28,
  screen = '#1b4a24',
  glow = '#6af07a',
  stand = true,
}: {
  x: number
  y?: number
  w?: number
  h?: number
  screen?: string
  glow?: string
  stand?: boolean
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={INK} />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 5} fill={screen} />
      <rect x={x + 4} y={y + 5} width={w - 12} height={2} fill={glow} opacity="0.85" />
      <rect x={x + 4} y={y + 9} width={w - 18} height={2} fill={glow} opacity="0.6" />
      <rect x={x + 4} y={y + 13} width={w - 9} height={1} fill={glow} opacity="0.4" />
      <rect x={x + 4} y={y + 16} width={w - 22} height={1} fill={glow} opacity="0.4" />
      {stand && (
        <>
          <rect x={x + w / 2 - 4} y={y + h} width="8" height="6" fill="#3a3a3a" />
          <rect x={x + w / 2 - 10} y={y + h + 6} width="20" height="3" fill={INK} />
        </>
      )}
    </g>
  )
}

function Shelf({ x, y = 22, w = 58, h = 86, wood = '#5a3a1f' }: { x: number; y?: number; w?: number; h?: number; wood?: string }) {
  const rows = 4
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={INK} />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} fill={wood} />
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} fill="#2a1a10" />
      {Array.from({ length: rows }, (_, row) => (
        <g key={row}>
          <rect x={x + 2} y={y + 20 + row * 21} width={w - 4} height="3" fill={wood} />
          {Array.from({ length: 6 }, (_, book) => {
            const colors = ['#c9302c', '#2f6ab0', '#d9a441', '#3f8a3f', '#8a4ac0', '#c9a15a']
            const bh = 12 + ((book * 5) % 6)
            return (
              <rect
                key={book}
                x={x + 6 + book * 8}
                y={y + 18 + row * 21 - bh}
                width="5"
                height={bh}
                fill={colors[(book + row) % colors.length]}
              />
            )
          })}
        </g>
      ))}
    </g>
  )
}

function Poster({ x, y, w = 30, h = 38, fill = '#1f2f7a', accent = '#35c6c6' }: { x: number; y: number; w?: number; h?: number; fill?: string; accent?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={INK} />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} fill={fill} />
      <rect x={x + 5} y={y + 6} width={w - 10} height={Math.max(4, h * 0.35)} fill={accent} />
      <rect x={x + 5} y={y + h - 9} width={w - 14} height={2} fill="#f2e6b0" />
      <rect x={x + 5} y={y + h - 5} width={w - 20} height={1} fill="#f2e6b0" opacity="0.7" />
    </g>
  )
}

function Arcade({ x, y = 118, color = '#5a2a8a', accent = '#35c6c6' }: { x: number; y?: number; color?: string; accent?: string }) {
  return (
    <g>
      <rect x={x} y={y} width="34" height="96" fill={INK} />
      <rect x={x + 2} y={y + 2} width="30" height="92" fill={color} />
      <rect x={x + 4} y={y + 8} width="26" height="24" fill="#0a0a12" />
      <rect x={x + 7} y={y + 11} width="20" height="16" fill="#1b4a8a" />
      <rect x={x + 9} y={y + 14} width="7" height="5" fill={accent} />
      <rect x={x + 5} y={y + 37} width="24" height="8" fill="#2a1a3a" />
      <rect x={x + 9} y={y + 39} width="3" height="4" fill="#e23b2e" />
      <rect x={x + 15} y={y + 39} width="3" height="4" fill="#f2d43d" />
      <rect x={x + 21} y={y + 39} width="3" height="4" fill={accent} />
      <rect x={x + 8} y={y + 50} width="18" height="4" fill="#0a0a12" />
      <rect x={x + 3} y={y + 60} width="28" height="20" fill={accent} opacity="0.45" />
      <rect x={x + 3} y={y + 88} width="28" height="4" fill="#0a0a12" />
    </g>
  )
}

function Couch({ x, y = 154, color = '#7a2222' }: { x: number; y?: number; color?: string }) {
  return (
    <g>
      <rect x={x} y={y} width="84" height="5" fill={INK} />
      <rect x={x + 2} y={y + 5} width="80" height="26" fill={color} />
      <rect x={x + 2} y={y + 5} width="80" height="4" fill="#a83a32" />
      <rect x={x + 8} y={y + 15} width="30" height="16" fill="#4a1212" />
      <rect x={x + 46} y={y + 15} width="30" height="16" fill="#4a1212" />
      <rect x={x - 5} y={y + 8} width="10" height="32" fill={color} />
      <rect x={x + 79} y={y + 8} width="10" height="32" fill={color} />
      <rect x={x + 6} y={y + 31} width="72" height="6" fill="#2a0a0a" />
      <rect x={x + 8} y={y + 37} width="6" height="6" fill={INK} />
      <rect x={x + 70} y={y + 37} width="6" height="6" fill={INK} />
    </g>
  )
}

function ServerRack({ x, y = 24, h = 108, led = '#b06cff' }: { x: number; y?: number; h?: number; led?: string }) {
  return (
    <g>
      <rect x={x} y={y} width="40" height={h} fill={INK} />
      <rect x={x + 2} y={y + 2} width="36" height={h - 4} fill="#232331" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={x + 5} y={y + 6 + i * 12} width="30" height="9" fill="#141420" />
          <rect x={x + 7} y={y + 9 + i * 12} width="14" height="2" fill={led} opacity="0.85" />
          <rect x={x + 26} y={y + 8 + i * 12} width="3" height="3" fill={i % 3 === 0 ? '#6af07a' : led} className={`lair-led lair-led-${i % 4}`} />
          <rect x={x + 31} y={y + 8 + i * 12} width="3" height="3" fill="#e23b2e" opacity="0.6" />
        </g>
      ))}
    </g>
  )
}

function Corkboard({ x, y = 20, w = 88, h = 62, accent = '#d9a441' }: { x: number; y?: number; w?: number; h?: number; accent?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={INK} />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} fill="#a87a4a" />
      {Array.from({ length: 7 }, (_, i) => {
        const px = x + 6 + ((i * 23) % (w - 22))
        const py = y + 7 + ((i * 17) % (h - 26))
        return (
          <g key={i} transform={`rotate(${i % 2 ? 5 : -4} ${px + 9} ${py + 7})`}>
            <rect x={px} y={py} width="18" height="16" fill="#f4ecd4" stroke={INK} strokeWidth="1" />
            <rect x={px + 3} y={py + 4} width="11" height="1" fill="#9a8a6a" />
            <rect x={px + 3} y={py + 7} width="8" height="1" fill="#9a8a6a" />
            <rect x={px + 3} y={py + 10} width="12" height="1" fill="#9a8a6a" />
            <rect x={px + 8} y={py - 1} width="3" height="3" fill={accent} />
          </g>
        )
      })}
    </g>
  )
}

function Plant({ x, y = 166 }: { x: number; y?: number }) {
  return (
    <g>
      <rect x={x - 4} y={y} width="24" height="5" fill={INK} />
      <rect x={x - 2} y={y + 5} width="20" height="16" fill="#b05a2a" />
      <rect x={x - 2} y={y + 5} width="20" height="3" fill="#d97a3a" />
      <rect x={x + 6} y={y - 16} width="3" height="16" fill="#2f6a2f" />
      <rect x={x + 1} y={y - 20} width="10" height="9" fill="#3f8a3f" />
      <rect x={x + 10} y={y - 14} width="10" height="8" fill="#2f7a34" />
      <rect x={x - 4} y={y - 12} width="9" height="7" fill="#4faa4a" />
    </g>
  )
}

function Crt({ x, y = 144, screen = '#2a2a2a' }: { x: number; y?: number; screen?: string }) {
  return (
    <g>
      <rect x={x} y={y} width="46" height="40" fill={INK} />
      <rect x={x + 2} y={y + 2} width="42" height="30" fill="#b5ac94" />
      <rect x={x + 5} y={y + 5} width="32" height="24" fill={screen} />
      <rect x={x + 8} y={y + 9} width="18" height="2" fill="#6af07a" opacity="0.7" />
      <rect x={x + 8} y={y + 14} width="12" height="2" fill="#6af07a" opacity="0.5" />
      <rect x={x + 39} y={y + 10} width="2" height="4" fill="#e23b2e" />
      <rect x={x + 8} y={y + 32} width="30" height="4" fill="#8a8272" />
      <rect x={x + 4} y={y + 36} width="38" height="4" fill={INK} />
    </g>
  )
}

/** Small pixel pictograms used inside the speech bubble. */
export function LairIcon({ name, size = 56 }: { name: LairIconName; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true" className="lair-icon">
      {name === 'nacho' && (
        <g>
          <polygon points="3,21 12,3 21,21" fill="#e8c86a" stroke={INK} strokeWidth="1.4" />
          <polygon points="6,21 9,12 12,17 15,11 18,21" fill="#f2a52a" />
          <rect x="8" y="16" width="2" height="3" fill="#f2d43d" />
          <rect x="13" y="15" width="2" height="4" fill="#f2d43d" />
          <rect x="16" y="18" width="2" height="2" fill="#e23b2e" />
        </g>
      )}
      {name === 'bong' && (
        <g>
          <rect x="9" y="3" width="6" height="3" fill={INK} />
          <rect x="8" y="6" width="8" height="3" fill="#e8e8e8" />
          <rect x="9" y="9" width="6" height="4" fill="#8ac8d8" />
          <rect x="9" y="13" width="6" height="8" fill="#cfe8f0" opacity="0.85" />
          <rect x="7" y="21" width="10" height="2" fill={INK} />
          <rect x="5" y="8" width="3" height="5" fill="#d9a441" />
          <rect x="4" y="6" width="5" height="3" fill="#8a5a30" />
          <rect x="3" y="3" width="2" height="2" fill="#b0b0b0" />
          <rect x="6" y="1" width="2" height="2" fill="#b0b0b0" />
        </g>
      )}
      {name === 'pixie' && (
        <g>
          <rect x="4" y="5" width="16" height="4" fill="#e23b2e" />
          <rect x="5" y="9" width="14" height="3" fill="#f2d43d" />
          <rect x="6" y="12" width="12" height="3" fill="#e23b2e" />
          <rect x="7" y="15" width="10" height="3" fill="#f2d43d" />
          <rect x="8" y="18" width="8" height="3" fill="#e23b2e" />
          <rect x="4" y="4" width="16" height="1" fill={INK} />
        </g>
      )}
      {name === 'terminal' && (
        <g>
          <rect x="2" y="4" width="20" height="16" fill={INK} />
          <rect x="4" y="6" width="16" height="12" fill="#102810" />
          <rect x="6" y="9" width="3" height="2" fill="#6af07a" />
          <rect x="10" y="12" width="6" height="2" fill="#6af07a" />
          <rect x="6" y="14" width="2" height="2" fill="#6af07a" />
        </g>
      )}
      {name === 'gavel' && (
        <g>
          <rect x="4" y="6" width="10" height="6" fill="#8a5a30" />
          <rect x="5" y="7" width="8" height="4" fill="#b07a44" />
          <rect x="13" y="8" width="7" height="2" fill="#6b3f1c" />
          <rect x="12" y="5" width="2" height="8" fill={INK} />
          <rect x="4" y="18" width="16" height="3" fill="#8a5a30" />
          <rect x="2" y="21" width="20" height="2" fill={INK} />
        </g>
      )}
      {name === 'lightning' && (
        <g>
          <polygon points="14,1 5,13 11,13 9,23 19,10 13,10" fill="#f2d43d" stroke={INK} strokeWidth="1" />
          <polygon points="13,3 8,11 12,11 11,18 16,9 12,9" fill="#fff2a0" />
        </g>
      )}
      {name === 'browser' && (
        <g>
          <rect x="2" y="3" width="20" height="18" fill={INK} />
          <rect x="4" y="5" width="16" height="14" fill="#f4f4f4" />
          <rect x="4" y="5" width="16" height="4" fill="#1b2fa0" />
          <rect x="6" y="6" width="2" height="2" fill="#e23b2e" />
          <rect x="9" y="6" width="2" height="2" fill="#f2d43d" />
          <rect x="12" y="6" width="2" height="2" fill="#6af07a" />
          <rect x="6" y="11" width="7" height="5" fill="#8ac8e8" />
          <rect x="15" y="11" width="3" height="2" fill="#8a8a8a" />
          <rect x="15" y="14" width="3" height="2" fill="#8a8a8a" />
        </g>
      )}
      {name === 'cigar' && (
        <g>
          <rect x="4" y="13" width="16" height="6" fill="#6b3f1c" />
          <rect x="4" y="13" width="5" height="6" fill="#8a5a30" />
          <rect x="17" y="13" width="3" height="6" fill="#e23b2e" />
          <rect x="18" y="12" width="2" height="2" fill="#f2d43d" />
          <rect x="16" y="7" width="2" height="2" fill="#b0b0b0" />
          <rect x="14" y="4" width="2" height="2" fill="#b0b0b0" />
          <rect x="18" y="3" width="2" height="2" fill="#b0b0b0" />
        </g>
      )}
      {name === 'money' && (
        <g>
          <rect x="2" y="9" width="20" height="11" fill={INK} />
          <rect x="4" y="11" width="16" height="7" fill="#3f8a3f" />
          <rect x="10" y="8" width="6" height="13" fill="#2f6a2f" stroke={INK} strokeWidth="1" />
          <rect x="6" y="6" width="14" height="2" fill="#3f8a3f" />
          <rect x="11" y="12" width="3" height="5" fill="#cfe8b0" />
        </g>
      )}
      {name === 'magnifier' && (
        <g>
          <circle cx="10" cy="10" r="7" fill="#9fc6d8" stroke={INK} strokeWidth="2" />
          <circle cx="10" cy="10" r="4" fill="#e8f6fa" />
          <rect x="15" y="15" width="7" height="3" fill="#6b3f1c" transform="rotate(45 15 15)" />
        </g>
      )}
      {name === 'stamp' && (
        <g>
          <rect x="5" y="3" width="14" height="6" fill="#8a8a8a" />
          <rect x="7" y="9" width="10" height="4" fill="#6b6b6b" />
          <rect x="3" y="13" width="18" height="7" fill="#c9302c" />
          <rect x="5" y="15" width="14" height="3" fill="#8a1f1f" />
          <rect x="8" y="20" width="8" height="2" fill={INK} />
        </g>
      )}
      {name === 'phone' && (
        <g>
          <rect x="4" y="3" width="7" height="18" fill={INK} />
          <rect x="5" y="4" width="5" height="16" fill="#c9302c" />
          <rect x="6" y="6" width="3" height="3" fill="#f4f4f4" />
          <rect x="7" y="10" width="1" height="6" fill="#8a1f1f" />
        </g>
      )}
      {name === 'quill' && (
        <g>
          <polygon points="19,2 8,11 6,17 12,15 21,5" fill="#f2e6b0" stroke={INK} strokeWidth="1" />
          <rect x="5" y="16" width="8" height="2" fill="#6b3f1c" transform="rotate(35 9 17)" />
          <rect x="12" y="6" width="1" height="7" fill="#b9a97a" transform="rotate(40 12 10)" />
        </g>
      )}
      {name === 'gear' && (
        <g fill="#9fc6d8" stroke={INK} strokeWidth="1">
          <rect x="9" y="1" width="6" height="22" />
          <rect x="1" y="9" width="22" height="6" />
          <rect x="4" y="4" width="16" height="16" />
          <circle cx="12" cy="12" r="4" fill={INK} />
          <circle cx="12" cy="12" r="2" fill={INK} />
        </g>
      )}
      {name === 'coffee' && (
        <g>
          <rect x="5" y="8" width="12" height="12" fill="#f4f4f4" />
          <rect x="5" y="8" width="12" height="3" fill="#c9302c" />
          <rect x="17" y="11" width="4" height="6" fill="#e8e8e8" />
          <rect x="2" y="8" width="20" height="2" fill={INK} />
          <rect x="7" y="4" width="2" height="2" fill="#b0b0b0" />
          <rect x="11" y="2" width="2" height="3" fill="#b0b0b0" />
          <rect x="14" y="5" width="2" height="2" fill="#b0b0b0" />
        </g>
      )}
      {name === 'flask' && (
        <g>
          <rect x="9" y="2" width="6" height="3" fill={INK} />
          <polygon points="9,5 15,5 20,21 4,21" fill="#8ac8d8" stroke={INK} strokeWidth="1.2" />
          <polygon points="7,15 17,15 20,21 4,21" fill="#b03fc0" opacity="0.8" />
          <rect x="8" y="13" width="3" height="3" fill="#cfe8f0" />
        </g>
      )}
      {name === 'joystick' && (
        <g>
          <rect x="3" y="16" width="18" height="6" fill={INK} />
          <rect x="5" y="17" width="14" height="4" fill="#6b6b6b" />
          <rect x="11" y="7" width="2" height="10" fill="#3a3a3a" />
          <circle cx="12" cy="6" r="4" fill="#e23b2e" stroke={INK} strokeWidth="1" />
          <rect x="6" y="18" width="2" height="2" fill="#f2d43d" />
          <rect x="16" y="18" width="2" height="2" fill="#f2d43d" />
        </g>
      )}
      {name === 'trophy' && (
        <g>
          <rect x="6" y="3" width="12" height="8" fill="#f2d43d" stroke={INK} strokeWidth="1" />
          <rect x="3" y="4" width="3" height="5" fill="#d9a441" />
          <rect x="18" y="4" width="3" height="5" fill="#d9a441" />
          <rect x="10" y="11" width="4" height="5" fill="#d9a441" />
          <rect x="6" y="16" width="12" height="4" fill="#8a5a30" />
          <rect x="4" y="20" width="16" height="2" fill={INK} />
        </g>
      )}
      {name === 'paper' && (
        <g>
          <rect x="4" y="2" width="16" height="20" fill={INK} />
          <rect x="6" y="4" width="12" height="16" fill="#f4ecd4" />
          <rect x="8" y="7" width="8" height="1" fill="#9a8a6a" />
          <rect x="8" y="10" width="8" height="1" fill="#9a8a6a" />
          <rect x="8" y="13" width="6" height="1" fill="#9a8a6a" />
          <rect x="8" y="16" width="8" height="2" fill="#c9302c" />
        </g>
      )}
      {name === 'pizza' && (
        <g>
          <polygon points="12,2 21,21 3,21" fill="#f2c14a" stroke={INK} strokeWidth="1.2" />
          <rect x="4" y="19" width="16" height="3" fill="#b07a44" />
          <circle cx="12" cy="13" r="2" fill="#c9302c" />
          <circle cx="9" cy="17" r="2" fill="#c9302c" />
          <circle cx="15" cy="17" r="2" fill="#c9302c" />
        </g>
      )}
      {name === 'music' && (
        <g>
          <rect x="9" y="3" width="3" height="14" fill="#f2d43d" />
          <rect x="17" y="1" width="3" height="14" fill="#f2d43d" />
          <rect x="9" y="3" width="11" height="3" fill="#f2d43d" />
          <ellipse cx="7" cy="18" rx="4" ry="3" fill="#f2d43d" stroke={INK} strokeWidth="1" />
          <ellipse cx="15" cy="16" rx="4" ry="3" fill="#f2d43d" stroke={INK} strokeWidth="1" />
        </g>
      )}
      {name === 'cocktail' && (
        <g>
          <polygon points="3,4 21,4 12,14" fill="#8ac8e8" stroke={INK} strokeWidth="1.4" />
          <polygon points="5,6 19,6 12,12" fill="#e0576b" />
          <rect x="11" y="14" width="2" height="7" fill="#d9d9d9" />
          <rect x="7" y="21" width="10" height="2" fill="#d9d9d9" />
          <circle cx="16" cy="8" r="2" fill="#3f8a3f" />
          <rect x="17" y="2" width="2" height="4" fill="#f2d43d" />
        </g>
      )}
      {name === 'barbell' && (
        <g>
          <rect x="2" y="11" width="20" height="3" fill="#9a9a9a" />
          <rect x="4" y="7" width="4" height="11" fill="#2a2a2a" />
          <rect x="16" y="7" width="4" height="11" fill="#2a2a2a" />
          <rect x="5" y="8" width="2" height="8" fill="#5a5a5a" />
          <rect x="17" y="8" width="2" height="8" fill="#5a5a5a" />
          <rect x="8" y="12" width="8" height="1" fill="#d9d9d9" />
        </g>
      )}
    </svg>
  )
}

function specialScene(crew: CrewId) {
  if (crew === 'milo' || crew === 'stack') return <ShowOffice crew={crew} />
  if (crew === 'rex') return <ShowGym />
  if (crew === 'wren') return <ShowLobby />
  if (crew === 'ines') return <ShowHotTub />
  return null
}

/** Flat pixel room art for a character. The resident is a DOM sprite above it. */
export function LairArt({ crew }: { crew: CrewId }) {
  // The four show locations use their own full-scene art instead of the generic room shell.
  const showRoom = specialScene(crew)
  if (showRoom) return showRoom

  const spec = LAIRS[crew]
  return (
    <svg className="lair-svg" viewBox="0 0 536 220" shapeRendering="crispEdges" aria-hidden="true">
      <Shell spec={spec} window={crew !== 'xortron'} />

      {crew === 'sable' && (
        <>
          <Corkboard x={190} y={20} w={110} h={64} accent={spec.accent} />
          <Shelf x={462} y={24} w={58} h={86} wood="#4a3020" />
          <Desk x={318} y={146} w={150} top="#6b4a2a" front="#4a3020" />
          <Monitor x={338} y={108} w={42} h={30} screen="#0d2230" glow="#46d6c3" />
          <Monitor x={388} y={112} w={34} h={26} screen="#1b2436" glow="#8aa8ff" />
          <rect x="432" y="138" width="10" height="8" fill="#f4f4f4" />
          <rect x="432" y="138" width="10" height="2" fill="#c9302c" />
          <rect x="446" y="141" width="12" height="5" fill="#f4ecd4" transform="rotate(-8 446 141)" />
          <Plant x={285} y={172} />
          <Poster x={150} y={30} w={30} h={40} fill="#1f2f7a" accent={spec.accent} />
          <Poster x={410} y={26} w={30} h={38} fill="#2a1f42" accent="#8aa8ff" />
        </>
      )}

      {crew === 'vera' && (
        <>
          <rect x="176" y="22" width="128" height="76" fill={INK} />
          <rect x="179" y="25" width="122" height="70" fill="#f4f4f4" />
          <rect x="179" y="25" width="122" height="5" fill="#8a8a8a" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={192 + i * 26} y={40 + (i % 2) * 22} width="16" height="14" fill="#d9e6e0" />
              <rect x={195 + i * 26} y={44 + (i % 2) * 22} width="10" height="1" fill="#7a8a82" />
              <rect x={195 + i * 26} y={47 + (i % 2) * 22} width="7" height="1" fill="#7a8a82" />
            </g>
          ))}
          <rect x="300" y="88" width="28" height="7" fill="#c9302c" />
          <rect x="304" y="90" width="20" height="3" fill="#8a1f1f" />
          <Shelf x={470} y={26} w={50} h={84} wood="#7a8a82" />
          <Desk x={320} y={148} w={146} top="#9aa8a0" front="#6f7d75" trim="#8a9a92" />
          <Monitor x={336} y={110} w={40} h={28} screen="#102810" glow="#6af07a" />
          <Monitor x={386} y={114} w={30} h={24} screen="#2a0a0a" glow="#e0576b" />
          <rect x="428" y="136" width="26" height="12" fill="#f4f4f4" stroke={INK} strokeWidth="1" />
          <rect x="432" y="139" width="18" height="2" fill="#8a8a8a" />
          <rect x="432" y="143" width="12" height="2" fill="#8a8a8a" />
          <Crt x={224} y={150} screen="#20202a" />
          <rect x="150" y="150" width="52" height="38" fill={INK} />
          <rect x="153" y="153" width="46" height="32" fill="#8a9a92" />
          <rect x="157" y="157" width="38" height="2" fill="#f4f4f4" />
          <rect x="157" y="162" width="30" height="2" fill="#f4f4f4" />
          <Plant x={135} y={172} />
        </>
      )}

      {crew === 'ines' && (
        <>
          <Shelf x={26} y={26} w={60} h={86} wood="#3a2a4a" />
          <Poster x={104} y={26} w={36} h={46} fill="#4a1a6a" accent={spec.accent} />
          {/* tesla coil */}
          <rect x="228" y="118" width="50" height="34" fill={INK} />
          <rect x="232" y="122" width="42" height="28" fill="#3a3a4a" />
          <rect x="245" y="52" width="12" height="70" fill="#6b6b7a" />
          <rect x="241" y="50" width="20" height="6" fill="#9a9ab0" />
          <rect x="238" y="76" width="26" height="4" fill="#d9a441" />
          <rect x="241" y="90" width="20" height="4" fill="#d9a441" />
          <rect x="248" y="38" width="6" height="12" fill="#9a9ab0" />
          <polygon points="251,26 243,44 249,44 246,58 258,38 251,38" fill="#f2d43d" opacity="0.85" className="lair-zap" />
          <Desk x={330} y={148} w={140} top="#4a3a5a" front="#2f2440" trim="#5a4a6a" />
          <rect x="346" y="128" width="46" height="20" fill="#1b2fa0" transform="rotate(-3 346 128)" />
          <rect x="350" y="132" width="38" height="1" fill="#a8e0f2" />
          <rect x="350" y="136" width="30" height="1" fill="#a8e0f2" />
          <rect x="350" y="140" width="34" height="1" fill="#a8e0f2" />
          <Monitor x={400} y={110} w={38} h={28} screen="#1a0a28" glow={spec.accent} />
          <rect x="470" y="148" width="18" height="30" fill="#2a1f42" />
          <rect x="472" y="142" width="14" height="6" fill="#8ac8d8" />
          <rect x="474" y="152" width="10" height="18" fill="#b03fc0" opacity="0.7" />
          <rect x="150" y="152" width="34" height="24" fill="#2f2440" />
          <rect x="154" y="148" width="26" height="5" fill="#8ac8d8" />
          <Plant x={300} y={172} />
        </>
      )}

      {crew === 'chip' && (
        <>
          {/* basement: concrete, bare bulb, laundry, old couch */}
          <rect x="196" y="8" width="2" height="24" fill="#2a2a2a" />
          <rect x="190" y="32" width="14" height="8" fill="#f2e6b0" className="lair-bulb" />
          <Corkboard x={352} y={20} w={80} h={54} accent={spec.accent} />
          <Crt x={430} y={140} screen="#101820" />
          <rect x="430" y="128" width="46" height="10" fill="#4a4640" />
          <rect x="434" y="130" width="38" height="3" fill="#5a564f" />
          <Couch x={48} y={156} color="#4a5a3a" />
          <Desk x={292} y={156} w={110} top="#5a4a3a" front="#3a2f26" />
          {/* pixie stix tray */}
          <rect x="306" y="146" width="52" height="12" fill="#d9d9d9" />
          <rect x="306" y="146" width="52" height="3" fill="#f4f4f4" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={311 + i * 9} y={150} width="6" height="2" fill="#ffffff" />
              <rect x={311 + i * 9} y={153} width="6" height="1" fill="#e23b2e" />
            </g>
          ))}
          <rect x="362" y="142" width="10" height="13" fill="#c9302c" />
          <rect x="362" y="142" width="10" height="3" fill="#f2d43d" />
          <rect x="242" y="168" width="34" height="10" fill="#f2e6b0" transform="rotate(6 242 168)" />
          <rect x="246" y="170" width="24" height="2" fill="#b03a12" />
          <rect x="200" y="158" width="24" height="16" fill="#2a2a2a" />
          <rect x="204" y="154" width="16" height="5" fill="#4a4640" />
          <Plant x={492} y={176} />
        </>
      )}

      {crew === 'milo' && (
        <>
          <Poster x={150} y={26} w={32} h={40} fill="#1f2f6a" accent="#4caf50" />
          <Shelf x={26} y={26} w={56} h={84} wood="#8a7a5a" />
          <Desk x={280} y={146} w={180} top="#8a7a5a" front="#6a5a42" trim="#9a8a6a" />
          <Monitor x={300} y={106} w={44} h={30} screen="#102810" glow="#6af07a" />
          <Monitor x={356} y={110} w={38} h={28} screen="#1b2a3b" glow="#8aa8ff" />
          <Monitor x={402} y={106} w={38} h={28} screen="#2a1a10" glow="#d9a441" />
          <rect x="446" y="140" width="10" height="8" fill="#f4f4f4" />
          <rect x="446" y="140" width="10" height="2" fill="#4caf50" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={310 + i * 18} y={92} width="12" height="10" fill={['#f2d43d', '#8ae06a', '#8ac8e8'][i]} transform={`rotate(${i * 6 - 5} ${310 + i * 18} 92)`} />
          ))}
          <rect x="200" y="150" width="42" height="44" fill={INK} />
          <rect x="203" y="153" width="36" height="38" fill="#9a8a6a" />
          <rect x="208" y="160" width="26" height="3" fill="#f4ecd4" />
          <rect x="208" y="166" width="26" height="3" fill="#f4ecd4" />
          <rect x="208" y="172" width="18" height="3" fill="#f4ecd4" />
          <Plant x={500} y={176} />
        </>
      )}

      {crew === 'rex' && (
        <>
          <Poster x={150} y={24} w={36} h={46} fill="#2a1a10" accent="#d9a441" />
          <Poster x={200} y={28} w={32} h={40} fill="#1f2f6a" accent="#f2d43d" />
          <Shelf x={470} y={26} w={48} h={80} wood="#6b3f1c" />
          <Desk x={300} y={146} w={190} h={42} top="#6b3f1c" front="#4a2a14" trim="#8a5a30" />
          <rect x="352" y="136" width="54" height="10" fill={INK} />
          <rect x="354" y="138" width="50" height="6" fill="#d9a441" />
          <text x="379" y="143" textAnchor="middle" fill="#3a2010" fontSize="4.4" fontFamily="'Press Start 2P', monospace">DEAN</text>
          <rect x="312" y="128" width="26" height="18" fill="#141414" />
          <rect x="316" y="131" width="18" height="10" fill="#2a3a6a" />
          <rect x="424" y="134" width="22" height="12" fill="#c9a15a" />
          <rect x="428" y="137" width="14" height="2" fill="#8a6a3a" />
          <rect x="428" y="141" width="10" height="2" fill="#8a6a3a" />
          {/* golf bag */}
          <rect x="252" y="140" width="22" height="42" fill={INK} />
          <rect x="254" y="146" width="18" height="32" fill="#2a3a2a" />
          <rect x="256" y="150" width="14" height="4" fill="#d9a441" />
          <rect x="258" y="120" width="2" height="22" fill="#9a9a9a" />
          <rect x="264" y="116" width="2" height="26" fill="#9a9a9a" />
          <rect x="270" y="122" width="2" height="20" fill="#9a9a9a" />
          <rect x="256" y="118" width="8" height="4" fill="#3a3a3a" />
          <rect x="262" y="114" width="8" height="4" fill="#3a3a3a" />
          <Plant x={226} y={176} />
        </>
      )}

      {crew === 'nia' && (
        <>
          <Poster x={120} y={22} w={32} h={42} fill="#1f2f6a" accent="#f2d43d" />
          <Poster x={162} y={28} w={28} h={36} fill="#4a1a6a" accent="#8aa8ff" />
          <Arcade x={468} y={112} color="#5a2a8a" accent="#8ae06a" />
          <Arcade x={500} y={124} color="#1f3f8a" accent="#f2d43d" />
          {/* desk with phone and chip bag */}
          <Desk x={300} y={150} w={150} top="#4a3a5a" front="#2f2440" trim="#5a4a6a" />
          <Monitor x={318} y={112} w={40} h={28} screen="#1a1230" glow="#b06cff" />
          <rect x="374" y="136" width="14" height="16" fill={INK} />
          <rect x="376" y="138" width="10" height="12" fill="#c9302c" />
          <rect x="377" y="140" width="8" height="3" fill="#f2d43d" />
          <rect x="400" y="142" width="18" height="10" fill="#f2d43d" />
          <rect x="402" y="144" width="14" height="2" fill="#c9a15a" />
          <rect x="402" y="147" width="10" height="2" fill="#c9a15a" />
          <rect x="424" y="136" width="16" height="16" fill="#e23b2e" />
          <rect x="426" y="139" width="12" height="3" fill="#f2d43d" />
          <rect x="428" y="144" width="8" height="2" fill="#f4f4f4" />
          {/* bean bag */}
          <ellipse cx="212" cy="190" rx="44" ry="18" fill="#4a2a6a" />
          <ellipse cx="212" cy="186" rx="38" ry="14" fill="#6a3a8a" />
          <rect x="168" y="182" width="88" height="4" fill={INK} opacity="0.5" />
          <Crt x={58} y={150} screen="#0a0a12" />
        </>
      )}

      {crew === 'theo' && (
        <>
          <Shelf x={22} y={24} w={64} h={88} wood="#4a3020" />
          <Shelf x={96} y={24} w={50} h={88} wood="#4a3020" />
          <Poster x={160} y={26} w={30} h={38} fill="#26394f" accent={spec.accent} />
          {/* typewriter desk */}
          <Desk x={322} y={148} w={168} top="#6b4a2a" front="#4a3020" trim="#8a5a30" />
          <rect x="340" y="120" width="54" height="28" fill={INK} />
          <rect x="343" y="123" width="48" height="22" fill="#3a3a3a" />
          <rect x="347" y="128" width="40" height="3" fill="#d9d9d9" />
          <rect x="352" y="134" width="30" height="2" fill="#8a8a8a" />
          <rect x="347" y="139" width="40" height="4" fill="#6b6b6b" />
          <rect x="412" y="132" width="30" height="16" fill="#f4ecd4" transform="rotate(-4 412 132)" />
          <rect x="416" y="136" width="20" height="1" fill="#9a8a6a" />
          <rect x="416" y="139" width="16" height="1" fill="#9a8a6a" />
          <rect x="416" y="142" width="22" height="1" fill="#9a8a6a" />
          <rect x="450" y="130" width="12" height="18" fill="#d9a441" />
          <rect x="448" y="124" width="16" height="7" fill="#f2e6b0" />
          <polygon points="456,124 486,104 498,124" fill="#f2d46a" opacity="0.25" />
          {/* cat */}
          <ellipse cx="250" cy="190" rx="16" ry="8" fill="#c9a15a" />
          <circle cx="238" cy="184" r="7" fill="#c9a15a" />
          <polygon points="233,179 235,172 239,178" fill="#c9a15a" />
          <polygon points="241,178 245,172 246,179" fill="#c9a15a" />
          <rect x="236" y="183" width="1" height="1" fill={INK} />
          <rect x="241" y="183" width="1" height="1" fill={INK} />
          <Plant x={300} y={176} />
        </>
      )}

      {crew === 'catalyst' && (
        <>
          <Poster x={152} y={22} w={38} h={48} fill="#1f2f6a" accent="#3fae4a" />
          <Shelf x={466} y={24} w={52} h={80} wood="#4a3020" />
          {/* big executive desk */}
          <Desk x={292} y={142} w={196} h={48} top="#4a3020" front="#2f1e10" trim="#8a5a30" />
          <rect x="350" y="132" width="58" height="10" fill={INK} />
          <rect x="352" y="134" width="54" height="6" fill="#d9a441" />
          <text x="379" y="139" textAnchor="middle" fill="#3a2010" fontSize="4" fontFamily="'Press Start 2P', monospace">LARRITY</text>
          {/* money stacks */}
          <rect x="310" y="126" width="24" height="16" fill="#3f8a3f" />
          <rect x="310" y="126" width="24" height="4" fill="#6ab06a" />
          <rect x="312" y="131" width="20" height="1" fill="#cfe8b0" />
          <rect x="316" y="114" width="18" height="12" fill="#3f8a3f" />
          {/* scotch + ashtray + cigar smoke */}
          <rect x="430" y="120" width="10" height="12" fill="#d9a441" />
          <rect x="431" y="116" width="8" height="4" fill="#f2e6b0" opacity="0.6" />
          <rect x="446" y="126" width="18" height="6" fill="#8a8a8a" />
          <rect x="452" y="123" width="8" height="3" fill="#6b3f1c" />
          <rect x="458" y="122" width="2" height="2" fill="#e23b2e" />
          <rect x="456" y="115" width="2" height="2" fill="#b0b0b0" className="lair-smoke" />
          <rect x="453" y="109" width="2" height="2" fill="#b0b0b0" className="lair-smoke" />
          <rect x="459" y="103" width="2" height="2" fill="#b0b0b0" className="lair-smoke" />
          {/* putting green + trophy */}
          <ellipse cx="236" cy="188" rx="56" ry="15" fill="#3f8a3f" />
          <ellipse cx="236" cy="185" rx="50" ry="12" fill="#4faa4a" />
          <rect x="234" y="160" width="2" height="26" fill="#e8e8e8" />
          <polygon points="236,160 254,165 236,170" fill="#c9302c" />
          <rect x="192" y="176" width="6" height="6" fill="#111111" />
          <rect x="146" y="164" width="34" height="26" fill="#8a5a30" />
          <rect x="150" y="158" width="26" height="7" fill="#d9a441" />
          <rect x="154" y="152" width="18" height="7" fill="#f2d43d" />
        </>
      )}

      {crew === 'stack' && (
        <>
          <Poster x={122} y={22} w={40} h={50} fill="#1b2fa0" accent="#e4572e" />
          <Poster x={170} y={30} w={30} h={38} fill="#1a1a1a" accent="#f2d43d" />
          {/* bong on the desk */}
          <Desk x={286} y={148} w={186} top="#5a4430" front="#3a2a1c" trim="#8a5a30" />
          <Monitor x={306} y={106} w={42} h={30} screen="#102810" glow="#6af07a" />
          <Monitor x={358} y={110} w={38} h={28} screen="#1a1a2a" glow="#e4572e" />
          <rect x="408" y="124" width="10" height="3" fill={INK} />
          <rect x="409" y="112" width="8" height="12" fill="#cfe8f0" opacity="0.85" />
          <rect x="410" y="106" width="6" height="6" fill="#8ac8d8" />
          <rect x="408" y="102" width="10" height="4" fill="#8a5a30" />
          <rect x="406" y="98" width="6" height="4" fill="#d9a441" />
          <rect x="420" y="92" width="2" height="2" fill="#b0b0b0" className="lair-smoke" />
          <rect x="417" y="86" width="2" height="2" fill="#b0b0b0" className="lair-smoke" />
          <rect x="424" y="80" width="2" height="2" fill="#b0b0b0" className="lair-smoke" />
          <rect x="436" y="136" width="24" height="12" fill="#f2e6b0" transform="rotate(7 436 136)" />
          <rect x="440" y="139" width="16" height="2" fill="#c9302c" />
          {/* pizza box + energy drinks */}
          <rect x="244" y="176" width="40" height="14" fill="#c9a15a" />
          <rect x="246" y="178" width="36" height="3" fill="#8a6a3a" />
          <rect x="248" y="166" width="8" height="12" fill="#2a6a2a" />
          <rect x="260" y="168" width="8" height="10" fill="#2a6a2a" />
          <rect x="272" y="164" width="8" height="14" fill="#6a2a2a" />
          <rect x="196" y="164" width="30" height="24" fill="#2a2a2a" />
          <rect x="200" y="160" width="22" height="5" fill="#4a4430" />
          <Plant x={498} y={178} />
        </>
      )}

      {crew === 'equalizer' && (
        <>
          <Shelf x={18} y={24} w={62} h={90} wood="#3a2a1c" />
          <Shelf x={88} y={24} w={62} h={90} wood="#3a2a1c" />
          <Poster x={176} y={26} w={34} h={44} fill="#1f2f6a" accent={spec.accent} />
          {/* law desk with gavel */}
          <Desk x={308} y={146} w={184} h={44} top="#4a3020" front="#2f1e10" trim="#8a5a30" />
          <rect x="332" y="130" width="16" height="16" fill="#8a5a30" />
          <rect x="334" y="128" width="12" height="4" fill="#b07a44" />
          <rect x="350" y="136" width="14" height="3" fill="#6b3f1c" transform="rotate(-20 350 136)" />
          <rect x="370" y="132" width="36" height="14" fill="#f4ecd4" transform="rotate(-3 370 132)" />
          <rect x="374" y="136" width="26" height="1" fill="#9a8a6a" />
          <rect x="374" y="139" width="20" height="1" fill="#9a8a6a" />
          <rect x="410" y="128" width="18" height="18" fill="#6b3f1c" />
          <rect x="414" y="132" width="10" height="10" fill="#8a5a30" />
          {/* filing boxes */}
          <rect x="238" y="158" width="40" height="36" fill="#c9a15a" />
          <rect x="240" y="160" width="36" height="6" fill="#8a6a3a" />
          <rect x="246" y="170" width="24" height="4" fill="#f4ecd4" />
          <rect x="238" y="132" width="40" height="26" fill="#b08a4a" />
          <rect x="244" y="140" width="24" height="4" fill="#f4ecd4" />
          {/* scales */}
          <rect x="486" y="140" width="4" height="30" fill="#d9a441" />
          <rect x="474" y="136" width="28" height="4" fill="#d9a441" />
          <rect x="470" y="148" width="12" height="3" fill="#8a8a8a" />
          <rect x="494" y="148" width="12" height="3" fill="#8a8a8a" />
          <rect x="468" y="151" width="16" height="2" fill="#6b6b6b" />
          <rect x="492" y="151" width="16" height="2" fill="#6b6b6b" />
        </>
      )}

      {crew === 'xortron' && (
        <>
          <ServerRack x={64} y={22} h={116} led={spec.accent} />
          <ServerRack x={118} y={22} h={116} led={spec.accent} />
          <ServerRack x={410} y={22} h={116} led="#8ae06a" />
          <ServerRack x={464} y={22} h={116} led={spec.accent} />
          {/* cable trunking */}
          <rect x="164" y="26" width="210" height="6" fill="#2a1f42" />
          <rect x="170" y="32" width="3" height="82" fill="#3a2a5a" />
          <rect x="214" y="32" width="3" height="70" fill="#3a2a5a" />
          <rect x="318" y="32" width="3" height="76" fill="#3a2a5a" />
          <rect x="360" y="32" width="3" height="64" fill="#3a2a5a" />
          {/* hologram pedestal */}
          <ellipse cx="268" cy="194" rx="52" ry="14" fill="#1a1230" />
          <ellipse cx="268" cy="190" rx="46" ry="11" fill="#2a1f42" />
          <rect x="258" y="172" width="20" height="18" fill="#3a2a5a" />
          <polygon points="268,92 316,150 220,150" fill={spec.accent} opacity="0.16" className="lair-holo" />
          <rect x="252" y="118" width="32" height="2" fill={spec.accent} opacity="0.55" />
          <rect x="244" y="128" width="48" height="2" fill={spec.accent} opacity="0.4" />
          <rect x="238" y="138" width="60" height="2" fill={spec.accent} opacity="0.3" />
          <rect x="246" y="108" width="44" height="2" fill={spec.accent} opacity="0.65" />
          <rect x="286" y="160" width="2" height="20" fill={spec.accent} opacity="0.5" />
          <rect x="248" y="160" width="2" height="20" fill={spec.accent} opacity="0.5" />
          <rect x="180" y="158" width="28" height="34" fill="#18121f" />
          <rect x="183" y="162" width="22" height="12" fill="#0d0820" />
          <rect x="186" y="166" width="12" height="2" fill={spec.accent} />
        </>
      )}

      {crew === 'wren' && (
        <>
          <Corkboard x={148} y={20} w={96} h={64} accent={spec.accent} />
          <Poster x={262} y={24} w={30} h={38} fill="#1b2fa0" accent="#f2d43d" />
          <Shelf x={470} y={26} w={48} h={80} wood="#8a6a4a" />
          <Desk x={300} y={146} w={190} top="#8a6a4a" front="#6a5036" trim="#a07a50" />
          <Monitor x={318} y={100} w={46} h={34} screen="#f4f4f4" glow="#1b2fa0" />
          <rect x="322" y="106" width="38" height="4" fill="#1b2fa0" />
          <rect x="324" y="114" width="14" height="12" fill="#8ac8e8" />
          <rect x="342" y="114" width="14" height="2" fill="#8a8a8a" />
          <rect x="342" y="119" width="10" height="2" fill="#8a8a8a" />
          <Monitor x={372} y={104} w={42} h={30} screen="#eae4f4" glow="#e0576b" />
          <rect x="376" y="110" width="34" height="4" fill="#e0576b" />
          <rect x="378" y="118" width="12" height="9" fill="#c9a15a" />
          <rect x="394" y="118" width="12" height="2" fill="#8a8a8a" />
          <rect x="394" y="123" width="8" height="2" fill="#8a8a8a" />
          <rect x="428" y="136" width="12" height="12" fill="#f4f4f4" />
          <rect x="428" y="136" width="12" height="3" fill="#e0576b" />
          <rect x="446" y="140" width="18" height="8" fill="#f4ecd4" transform="rotate(-6 446 140)" />
          <Plant x={282} y={172} />
        </>
      )}
    </svg>
  )
}
