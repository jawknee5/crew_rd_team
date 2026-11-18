import type { Accessory, CrewId, CrewMember, HairStyle, Palette } from '../data/crew'
import { CREW_BY_ID } from '../data/crew'

export const SPRITE_W = 20
export const SPRITE_H = 20

type Grid = string[][]
const TRANSPARENT = '.'

function blank(): Grid {
  return Array.from({ length: SPRITE_H }, () => Array.from({ length: SPRITE_W }, () => TRANSPARENT))
}

function put(g: Grid, x: number, y: number, c: string) {
  if (x < 0 || y < 0 || x >= SPRITE_W || y >= SPRITE_H) return
  g[y][x] = c
}

function fill(g: Grid, x: number, y: number, w: number, h: number, c: string) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) put(g, xx, yy, c)
  }
}

/* ---------- head + body ---------- */

function drawHead(g: Grid, p: Palette) {
  const hx = 5
  const hy = 2
  const hw = 10
  const hh = 10
  for (let y = 0; y < hh; y++) {
    for (let x = 0; x < hw; x++) {
      const edgeX = x === 0 || x === hw - 1
      const edgeY = y === 0 || y === hh - 1
      if (edgeX && edgeY) continue
      put(g, hx + x, hy + y, edgeX || edgeY ? p.o : p.s)
    }
  }
  // ears
  put(g, hx - 1, hy + 5, p.o)
  put(g, hx - 1, hy + 6, p.S)
  put(g, hx + hw, hy + 5, p.o)
  put(g, hx + hw, hy + 6, p.S)
  // face
  put(g, 7, 6, p.o)
  put(g, 12, 6, p.o)
  put(g, 9, 8, p.S)
  put(g, 9, 9, p.o)
  put(g, 10, 9, p.o)
}

function drawBody(g: Grid, p: Palette, kind: 'shirt' | 'coat' | 'hoodie' | 'jacket', accentColor: string) {
  // neck
  fill(g, 8, 11, 4, 2, p.S)
  fill(g, 8, 11, 4, 1, p.o)
  // shoulders + torso
  fill(g, 3, 13, 14, 7, p.o)
  fill(g, 4, 13, 12, 7, p.c)
  // shirt shading
  fill(g, 4, 18, 12, 2, p.C)
  // neckline
  put(g, 9, 13, p.o)
  put(g, 10, 13, p.o)
  if (kind === 'coat') {
    fill(g, 7, 14, 1, 2, p.C)
    fill(g, 12, 14, 1, 2, p.C)
    fill(g, 9, 14, 2, 2, p.w)
    fill(g, 8, 14, 1, 5, p.C)
    fill(g, 11, 14, 1, 5, p.C)
    put(g, 12, 15, accentColor)
  } else if (kind === 'jacket') {
    fill(g, 9, 14, 2, 5, p.C)
    put(g, 10, 14, accentColor)
    put(g, 9, 16, p.o)
    put(g, 10, 16, p.o)
  } else if (kind === 'hoodie') {
    // drawstrings
    put(g, 8, 14, p.w)
    put(g, 11, 14, p.w)
    put(g, 8, 15, p.w)
    put(g, 11, 15, p.w)
    // pocket line
    fill(g, 6, 17, 8, 1, p.C)
  } else {
    // collar + pocket
    put(g, 8, 14, p.C)
    put(g, 11, 14, p.C)
    fill(g, 5, 16, 4, 2, p.C)
    put(g, 12, 15, accentColor)
  }
  // arms
  fill(g, 1, 14, 3, 6, p.o)
  fill(g, 2, 14, 2, 5, p.c)
  fill(g, 16, 14, 3, 6, p.o)
  fill(g, 16, 14, 2, 5, p.c)
  fill(g, 2, 18, 2, 1, p.C)
  fill(g, 16, 18, 2, 1, p.C)
  // sleeve cuffs (hands sit below the table line)
  fill(g, 2, 18, 1, 1, p.C)
  fill(g, 17, 18, 1, 1, p.C)
}

/* ---------- hair styles ---------- */

function hairBob(g: Grid, p: Palette) {
  fill(g, 5, 0, 10, 1, p.o)
  fill(g, 6, 1, 8, 1, p.o)
  fill(g, 5, 2, 10, 1, p.h)
  fill(g, 4, 3, 12, 1, p.h)
  fill(g, 4, 4, 2, 4, p.h)
  fill(g, 14, 4, 2, 4, p.h)
  put(g, 4, 8, p.h)
  put(g, 15, 8, p.h)
  // fringe (kept one row high so the glasses don't bury the whole face)
  fill(g, 6, 3, 8, 1, p.h)
  put(g, 7, 3, p.H)
  put(g, 11, 3, p.H)
  put(g, 5, 4, p.o)
  put(g, 14, 4, p.o)
}

function hairBeanie(g: Grid, p: Palette) {
  fill(g, 6, 0, 8, 1, p.a)
  fill(g, 5, 1, 10, 1, p.a)
  fill(g, 4, 2, 12, 2, p.a)
  fill(g, 4, 4, 12, 1, p.C)
  // pompom
  put(g, 9, 0, p.w)
  put(g, 10, 0, p.w)
  // side hair
  put(g, 4, 5, p.h)
  put(g, 15, 5, p.h)
  put(g, 4, 6, p.h)
  put(g, 15, 6, p.h)
  // goggles resting on the band
  fill(g, 6, 4, 3, 1, p.w)
  fill(g, 11, 4, 3, 1, p.w)
  put(g, 9, 4, p.o)
  put(g, 10, 4, p.o)
}

function hairHood(g: Grid, p: Palette) {
  // hood shell
  fill(g, 4, 0, 12, 1, p.c)
  fill(g, 3, 1, 14, 1, p.c)
  fill(g, 2, 2, 2, 7, p.c)
  fill(g, 16, 2, 2, 7, p.c)
  fill(g, 4, 9, 1, 2, p.c)
  fill(g, 15, 9, 1, 2, p.c)
  // hood opening shade
  fill(g, 4, 2, 1, 6, p.C)
  fill(g, 15, 2, 1, 6, p.C)
  // outline
  fill(g, 4, 0, 12, 1, p.o)
  fill(g, 2, 2, 1, 7, p.o)
  fill(g, 17, 2, 1, 7, p.o)
  put(g, 3, 1, p.o)
  put(g, 16, 1, p.o)
  // fringe under hood
  fill(g, 6, 3, 3, 1, p.h)
  fill(g, 11, 3, 3, 1, p.h)
  put(g, 5, 4, p.h)
  put(g, 14, 4, p.h)
}

function hairBun(g: Grid, p: Palette) {
  // bun
  fill(g, 8, 0, 4, 1, p.h)
  fill(g, 7, 1, 6, 1, p.h)
  put(g, 9, 0, p.H)
  // crown
  fill(g, 6, 2, 8, 1, p.h)
  fill(g, 5, 3, 10, 1, p.h)
  fill(g, 4, 4, 1, 4, p.h)
  fill(g, 15, 4, 1, 4, p.h)
  // fringe with a side part
  fill(g, 6, 4, 7, 1, p.h)
  put(g, 11, 4, p.H)
  put(g, 5, 4, p.o)
  put(g, 14, 4, p.o)
  // loose strand
  put(g, 4, 8, p.h)
  put(g, 15, 8, p.h)
}

function hairCap(g: Grid, p: Palette) {
  fill(g, 6, 0, 8, 1, p.a)
  fill(g, 5, 1, 10, 1, p.a)
  fill(g, 4, 2, 12, 2, p.a)
  fill(g, 4, 4, 12, 1, p.d)
  // brim tab (backwards cap)
  fill(g, 15, 3, 3, 1, p.d)
  put(g, 9, 1, p.w)
  // sideburns
  fill(g, 4, 5, 1, 3, p.h)
  fill(g, 15, 5, 1, 3, p.h)
}

function drawRobot(g: Grid, p: Palette) {
  // antenna
  put(g, 9, 1, p.o)
  put(g, 10, 1, p.o)
  put(g, 9, 0, p.led)
  put(g, 10, 0, p.led)
  // head shell
  fill(g, 4, 2, 12, 9, p.o)
  fill(g, 5, 3, 10, 7, p.w)
  fill(g, 5, 3, 10, 1, p.a)
  // side bolts
  put(g, 3, 5, p.o)
  put(g, 16, 5, p.o)
  put(g, 3, 6, p.a)
  put(g, 16, 6, p.a)
  // screen
  fill(g, 6, 5, 8, 4, p.o)
  fill(g, 7, 6, 6, 2, p.screen)
  put(g, 8, 7, p.led)
  put(g, 11, 7, p.led)
  // speaker grill
  fill(g, 7, 9, 6, 1, p.d)
  fill(g, 8, 10, 4, 1, p.a)
}

/* ---------- accessories ---------- */

function drawAccessory(g: Grid, kind: Accessory, p: Palette) {
  if (kind === 'glasses') {
    fill(g, 6, 5, 4, 1, p.o)
    fill(g, 11, 5, 4, 1, p.o)
    fill(g, 6, 7, 4, 1, p.o)
    fill(g, 11, 7, 4, 1, p.o)
    put(g, 5, 6, p.o)
    put(g, 10, 6, p.o)
    put(g, 14, 6, p.o)
  } else if (kind === 'goggles') {
    fill(g, 6, 5, 3, 2, p.w)
    fill(g, 11, 5, 3, 2, p.w)
    put(g, 6, 5, p.o)
    put(g, 8, 5, p.o)
    put(g, 11, 5, p.o)
    put(g, 13, 5, p.o)
    put(g, 6, 6, p.o)
    put(g, 8, 6, p.o)
    put(g, 11, 6, p.o)
    put(g, 13, 6, p.o)
    put(g, 10, 5, p.o)
    put(g, 10, 6, p.o)
    fill(g, 4, 4, 2, 1, p.d)
    fill(g, 14, 4, 2, 1, p.d)
  } else if (kind === 'headphones') {
    fill(g, 4, 3, 12, 1, p.o)
    fill(g, 5, 2, 10, 1, p.o)
    fill(g, 3, 4, 2, 1, p.o)
    fill(g, 15, 4, 2, 1, p.o)
    fill(g, 2, 5, 3, 3, p.o)
    fill(g, 3, 6, 1, 2, p.a)
    fill(g, 15, 5, 3, 3, p.o)
    fill(g, 16, 6, 1, 2, p.a)
  } else if (kind === 'safety') {
    // amber safety glasses, thin enough to keep the eyes readable
    fill(g, 6, 5, 4, 1, p.a)
    fill(g, 11, 5, 4, 1, p.a)
    put(g, 5, 6, p.a)
    put(g, 10, 5, p.a)
    put(g, 14, 6, p.a)
    put(g, 6, 6, p.a)
    put(g, 9, 6, p.a)
    put(g, 11, 6, p.a)
    put(g, 13, 6, p.a)
  } else if (kind === 'stubble') {
    put(g, 6, 9, p.h)
    put(g, 8, 10, p.h)
    put(g, 11, 10, p.h)
    put(g, 13, 9, p.h)
    put(g, 6, 8, p.S)
    put(g, 13, 8, p.S)
  }
}

/* ---------- assembly ---------- */

function buildGrid(member: CrewMember): Grid {
  const g = blank()
  const p = member.palette

  if (member.hair === 'robot') {
    drawRobot(g, p)
    drawBody(g, p, 'jacket', member.accent)
    return g
  }

  const kind: 'shirt' | 'coat' | 'hoodie' | 'jacket' =
    member.id === 'ines' ? 'coat' : member.id === 'sable' ? 'hoodie' : member.id === 'rex' ? 'jacket' : 'shirt'

  drawBody(g, p, kind, member.accent)
  drawHead(g, p)

  const hair: Record<HairStyle, (grid: Grid, pal: Palette) => void> = {
    bob: hairBob,
    beanie: hairBeanie,
    hood: hairHood,
    bun: hairBun,
    cap: hairCap,
    robot: drawRobot,
  }
  hair[member.hair](g, p)
  drawAccessory(g, member.accessory, p)

  // little accent badge on the chest
  put(g, 13, 15, member.accent)
  return g
}

export interface SpriteData {
  runs: { x: number; y: number; w: number; color: string }[]
}

function toRuns(grid: Grid, palette: Palette): SpriteData {
  const runs: SpriteData['runs'] = []
  for (let y = 0; y < SPRITE_H; y++) {
    let x = 0
    while (x < SPRITE_W) {
      const key = grid[y][x]
      if (key === TRANSPARENT) {
        x++
        continue
      }
      let w = 1
      while (x + w < SPRITE_W && grid[y][x + w] === key) w++
      // grid cells already hold resolved palette colors
      runs.push({ x, y, w, color: key })
      x += w
    }
  }
  return { runs }
}

export function spriteAscii(id: CrewId): string[] {
  const member = CREW_BY_ID[id]
  const reverse: Record<string, string> = {}
  for (const [key, color] of Object.entries(member.palette)) reverse[color] = key
  return buildGrid(member).map((row) => row.map((cell) => (cell === '.' ? '.' : reverse[cell] ?? '?')).join(''))
}

export const SPRITES: Record<CrewId, SpriteData> = Object.keys(CREW_BY_ID).reduce(
  (acc, id) => {
    const member = CREW_BY_ID[id as CrewId]
    acc[id as CrewId] = toRuns(buildGrid(member), member.palette)
    return acc
  },
  {} as Record<CrewId, SpriteData>,
)
