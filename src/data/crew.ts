export type CrewId = 'vera' | 'sable' | 'chip' | 'ines' | 'milo' | 'rex'

export type HairStyle = 'bob' | 'beanie' | 'hood' | 'bun' | 'cap' | 'robot'
export type Accessory = 'glasses' | 'goggles' | 'headphones' | 'safety' | 'stubble' | 'none'

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
  palette: Palette
}

const INK = '#16141f'

export const CREW: CrewMember[] = [
  {
    id: 'sable',
    name: 'Sable Okonkwo',
    short: 'SABLE',
    role: 'Field Scout',
    specialty: 'Open-source recon',
    quirk: 'Downloads the whole forum. Twice.',
    bio: 'Finds the source behind the source. Keeps a graveyard of dead links that still somehow matter.',
    accent: '#46d6c3',
    paperKind: 'RECON DOSSIER',
    seat: 46,
    scale: 58,
    hair: 'hood',
    accessory: 'headphones',
    palette: {
      o: INK, s: '#8a5636', S: '#6b3f26', h: '#1d1b24', H: '#39344a',
      c: '#6b4b9e', C: '#4c3474', a: '#46d6c3', w: '#e9e4f4', d: '#2a1f42',
      screen: '#121a2b', led: '#46d6c3',
    },
  },
  {
    id: 'ines',
    name: 'Ines Halvorsen',
    short: 'INES',
    role: 'Prototyping Lead',
    specialty: 'Materials & constraints',
    quirk: 'Owns fourteen glue guns.',
    bio: 'If it can be taped together it can be tested. Suspicious of anything that only works in a demo.',
    accent: '#e4572e',
    paperKind: 'FEASIBILITY SKETCH',
    seat: 100.8,
    scale: 58,
    hair: 'bun',
    accessory: 'safety',
    palette: {
      o: INK, s: '#f0c6a4', S: '#d7a17d', h: '#c4502f', H: '#e07a4c',
      c: '#dfe4ea', C: '#b3bcc8', a: '#e4572e', w: '#ffffff', d: '#8d3a22',
      screen: '#121a2b', led: '#e4572e',
    },
  },
  {
    id: 'vera',
    name: 'Vera Kade',
    short: 'VERA',
    role: 'Lead Analyst',
    specialty: 'Problem decomposition',
    quirk: 'Keeps a scrapyard of abandoned premises.',
    bio: 'Frames the problem before anyone touches a keyboard. Allergic to vibes-based conclusions.',
    accent: '#f2b03d',
    paperKind: 'DECISION MEMO',
    seat: 155.6,
    scale: 60,
    hair: 'bob',
    accessory: 'glasses',
    palette: {
      o: INK, s: '#e8b58c', S: '#c99468', h: '#2f2a3d', H: '#4a4360',
      c: '#2f7f8f', C: '#1f5b68', a: '#f2b03d', w: '#fdf6e3', d: '#173f49',
      screen: '#121a2b', led: '#f2b03d',
    },
  },
  {
    id: 'milo',
    name: 'Milo Vance',
    short: 'MILO',
    role: 'Scriptsmith',
    specialty: 'Build & automation',
    quirk: 'Names variables after his cat.',
    bio: 'Writes the script that writes the script. Believes a stranger should be able to rerun his work in six months.',
    accent: '#f2a03d',
    paperKind: 'BUILD SHEET',
    seat: 210.4,
    scale: 58,
    hair: 'beanie',
    accessory: 'none',
    palette: {
      o: INK, s: '#c98d63', S: '#a87550', h: '#6d4a2f', H: '#8f6440',
      c: '#2f6a4f', C: '#204a37', a: '#f2a03d', w: '#d9e7e0', d: '#16342a',
      screen: '#121a2b', led: '#f2a03d',
    },
  },
  {
    id: 'chip',
    name: 'CHIP-9',
    short: 'CHIP-9',
    role: 'Automation Unit',
    specialty: 'Tooling & throughput',
    quirk: 'Hums modem noises when idle.',
    bio: 'Runs the boring parts at forty times human speed. Honest to a fault about what it did not check.',
    accent: '#7ef0c0',
    paperKind: 'TOOLING MANIFEST',
    seat: 265.2,
    scale: 58,
    hair: 'robot',
    accessory: 'none',
    palette: {
      o: INK, s: '#b9c4d6', S: '#8b99b1', h: '#6b7a92', H: '#93a2ba',
      c: '#7c8aa4', C: '#5a6780', a: '#b9c4d6', w: '#e6ecf5', d: '#3c4658',
      screen: '#101827', led: '#7ef0c0',
    },
  },
  {
    id: 'rex',
    name: 'Rex Alvarez',
    short: 'REX',
    role: 'Adversarial Reviewer',
    specialty: 'Red team & workarounds',
    quirk: "Keeps a file called what_breaks.txt.",
    bio: 'Reads the plan looking for the part that lies. Has never met an edge case he did not enjoy.',
    accent: '#d9534f',
    paperKind: 'RED TEAM NOTES',
    seat: 320,
    scale: 60,
    hair: 'cap',
    accessory: 'stubble',
    palette: {
      o: INK, s: '#a9714b', S: '#8a5a3a', h: '#3a2b23', H: '#5a4436',
      c: '#c8a13a', C: '#9b7a28', a: '#d9534f', w: '#f2ead2', d: '#6d5518',
      screen: '#121a2b', led: '#d9534f',
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
