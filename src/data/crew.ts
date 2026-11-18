export type CrewId = 'sable' | 'vera' | 'ines' | 'chip' | 'milo' | 'rex' | 'nia' | 'theo'

export type HairStyle = 'bob' | 'beanie' | 'hood' | 'bun' | 'cap' | 'robot' | 'curls' | 'long'
export type Accessory = 'glasses' | 'goggles' | 'headphones' | 'safety' | 'stubble' | 'earring' | 'none'
export type Outfit = 'shirt' | 'coat' | 'hoodie' | 'jacket'

export interface Palette {
  o: string // outline
  s: string // skin
  S: string // skin shade
  h: string // hair
  H: string // hair highlight
  c: string // shirt
  C: string // shirt shade
  a: string // accent
  w: string // white / metal
  d: string // dark accent
  screen: string
  led: string
}

export interface CrewMember {
  id: CrewId
  name: string
  short: string
  role: string
  specialty: string
  quirk: string
  bio: string
  accent: string
  paperKind: string
  seat: number // stage x in stage units (360 wide)
  scale: number // sprite size in stage units
  hair: HairStyle
  accessory: Accessory
  outfit: Outfit
  palette: Palette
}

const INK = '#16141f'

/**
 * The eight agent seats from TEAM_DIRECTORY_GUIDE.md, in crew order:
 * researcher → analyzer → architect → mac → engineer → QA → suggester → writer.
 */
export const CREW: CrewMember[] = [
  {
    id: 'sable',
    name: 'Sable Okonkwo',
    short: 'SABLE',
    role: 'Researcher',
    specialty: 'Primary sources & recon',
    quirk: 'Downloads the whole forum. Twice.',
    bio: 'Finds the source behind the source. Keeps a graveyard of dead links that still somehow matter.',
    accent: '#46d6c3',
    paperKind: 'RESEARCH DOSSIER',
    seat: 26,
    scale: 50,
    hair: 'hood',
    accessory: 'headphones',
    outfit: 'hoodie',
    palette: {
      o: INK, s: '#8a5636', S: '#6b3f26', h: '#1d1b24', H: '#39344a',
      c: '#6b4b9e', C: '#4c3474', a: '#46d6c3', w: '#e9e4f4', d: '#2a1f42',
      screen: '#121a2b', led: '#46d6c3',
    },
  },
  {
    id: 'vera',
    name: 'Vera Kade',
    short: 'VERA',
    role: 'Analyzer',
    specialty: 'Problem decomposition',
    quirk: 'Keeps a scrapyard of abandoned premises.',
    bio: 'Frames the problem before anyone touches a keyboard. Allergic to vibes-based conclusions.',
    accent: '#f2b03d',
    paperKind: 'DECISION MEMO',
    seat: 70,
    scale: 50,
    hair: 'bob',
    accessory: 'glasses',
    outfit: 'shirt',
    palette: {
      o: INK, s: '#e8b58c', S: '#c99468', h: '#2f2a3d', H: '#4a4360',
      c: '#2f7f8f', C: '#1f5b68', a: '#f2b03d', w: '#fdf6e3', d: '#173f49',
      screen: '#121a2b', led: '#f2b03d',
    },
  },
  {
    id: 'ines',
    name: 'Ines Halvorsen',
    short: 'INES',
    role: 'Architect',
    specialty: 'Systems & constraints',
    quirk: 'Owns fourteen glue guns.',
    bio: 'Sketches the structure before the paint. Suspicious of anything that only works in a demo.',
    accent: '#e4572e',
    paperKind: 'ARCHITECTURE SKETCH',
    seat: 114,
    scale: 50,
    hair: 'bun',
    accessory: 'safety',
    outfit: 'coat',
    palette: {
      o: INK, s: '#f0c6a4', S: '#d7a17d', h: '#c4502f', H: '#e07a4c',
      c: '#dfe4ea', C: '#b3bcc8', a: '#e4572e', w: '#ffffff', d: '#8d3a22',
      screen: '#121a2b', led: '#e4572e',
    },
  },
  {
    id: 'chip',
    name: 'CHIP-9',
    short: 'CHIP',
    role: 'Mac',
    specialty: 'macOS automation',
    quirk: 'Hums modem noises when idle.',
    bio: 'Lives on the Mac mini under the desk. Drives Shortcuts, AppleScript and the shell so nobody has to click things twice.',
    accent: '#7ef0c0',
    paperKind: 'AUTOMATION MANIFEST',
    seat: 158,
    scale: 50,
    hair: 'robot',
    accessory: 'none',
    outfit: 'jacket',
    palette: {
      o: INK, s: '#b9c4d6', S: '#8b99b1', h: '#6b7a92', H: '#93a2ba',
      c: '#7c8aa4', C: '#5a6780', a: '#b9c4d6', w: '#e6ecf5', d: '#3c4658',
      screen: '#101827', led: '#7ef0c0',
    },
  },
  {
    id: 'milo',
    name: 'Milo Vance',
    short: 'MILO',
    role: 'Engineer',
    specialty: 'Build & implementation',
    quirk: 'Names variables after his cat.',
    bio: 'Writes the script that writes the script. Believes a stranger should be able to rerun his work in six months.',
    accent: '#f2a03d',
    paperKind: 'BUILD SHEET',
    seat: 202,
    scale: 50,
    hair: 'beanie',
    accessory: 'none',
    outfit: 'shirt',
    palette: {
      o: INK, s: '#c98d63', S: '#a87550', h: '#6d4a2f', H: '#8f6440',
      c: '#2f6a4f', C: '#204a37', a: '#f2a03d', w: '#d9e7e0', d: '#16342a',
      screen: '#121a2b', led: '#f2a03d',
    },
  },
  {
    id: 'rex',
    name: 'Rex Alvarez',
    short: 'REX',
    role: 'QA',
    specialty: 'Testing & red team',
    quirk: 'Keeps a file called what_breaks.txt.',
    bio: 'Tests it like a hostile stranger. Has never met an edge case he did not enjoy.',
    accent: '#d9534f',
    paperKind: 'QA REPORT',
    seat: 246,
    scale: 50,
    hair: 'cap',
    accessory: 'stubble',
    outfit: 'jacket',
    palette: {
      o: INK, s: '#a9714b', S: '#8a5a3a', h: '#3a2b23', H: '#5a4436',
      c: '#c8a13a', C: '#9b7a28', a: '#d9534f', w: '#f2ead2', d: '#6d5518',
      screen: '#121a2b', led: '#d9534f',
    },
  },
  {
    id: 'nia',
    name: 'Nia Osei',
    short: 'NIA',
    role: 'Suggester',
    specialty: 'Lateral options',
    quirk: 'Has a note titled "bad idea, keep it".',
    bio: 'Answers the question nobody asked, and it turns out to be the useful one. Steals shamelessly from other industries.',
    accent: '#e07ba8',
    paperKind: 'OPTIONS DECK',
    seat: 290,
    scale: 50,
    hair: 'curls',
    accessory: 'earring',
    outfit: 'shirt',
    palette: {
      o: INK, s: '#a9754e', S: '#8a5a3a', h: '#241a2e', H: '#3d2c4d',
      c: '#c9a227', C: '#9d7d1c', a: '#e07ba8', w: '#f6ecd6', d: '#5e4a0f',
      screen: '#121a2b', led: '#e07ba8',
    },
  },
  {
    id: 'theo',
    name: 'Theo Marsh',
    short: 'THEO',
    role: 'Writer',
    specialty: 'Reports & narrative',
    quirk: 'Deletes the first paragraph every time.',
    bio: 'Turns six pages of argument into one page a stranger can act on. Allergic to jargon and weirdly proud of it.',
    accent: '#8aa8ff',
    paperKind: 'WRITTEN REPORT',
    seat: 334,
    scale: 50,
    hair: 'long',
    accessory: 'none',
    outfit: 'coat',
    palette: {
      o: INK, s: '#f0c9a8', S: '#d3a37f', h: '#4a3a2a', H: '#66503a',
      c: '#37506e', C: '#26394f', a: '#8aa8ff', w: '#f2f5fb', d: '#1b2a3b',
      screen: '#121a2b', led: '#8aa8ff',
    },
  },
]

export const CREW_BY_ID: Record<CrewId, CrewMember> = CREW.reduce(
  (acc, member) => {
    acc[member.id] = member
    return acc
  },
  {} as Record<CrewId, CrewMember>,
)

export const FIGURE_TOP = 94
