import type { CrewMember, Outfit, Palette } from '../data/crew'

export type PixelStyle = '8bit' | '16bit'

export interface SpriteRun {
  x: number
  y: number
  w: number
  color: string
}

export interface PreviewSprite {
  w: number
  h: number
  runs: SpriteRun[]
}

type Grid = (string | null)[][]

interface Metrics {
  style: PixelStyle
  detail: boolean
  W: number
  H: number
  hx: number
  hy: number
  hw: number
  hh: number
  by: number
  bw: number
  bh: number
  armW: number
  legY: number
  legH: number
  shoeH: number
}

/* The current art is a 20x20 chibi: a 12x10 head on eight rows of body.
   These grids stretch the figure to roughly 3.5 heads and give the arms,
   legs and shoes room to read as separate shapes. */
const M8: Metrics = {
  style: '8bit',
  detail: false,
  W: 28,
  H: 40,
  hx: 8,
  hy: 4,
  hw: 12,
  hh: 11,
  by: 16,
  bw: 14,
  bh: 12,
  armW: 3,
  legY: 28,
  legH: 9,
  shoeH: 2,
}

const M16: Metrics = {
  style: '16bit',
  detail: true,
  W: 44,
  H: 60,
  hx: 13,
  hy: 6,
  hw: 18,
  hh: 16,
  by: 23,
  bw: 18,
  bh: 19,
  armW: 3,
  legY: 42,
  legH: 13,
  shoeH: 3,
}

interface RPalette {
  ink: string
  skin: string
  skinShade: string
  hair: string
  hairHi: string
  shirt: string
  shirtShade: string
  accent: string
  white: string
  dark: string
  pants: string
  shoes: string
  eye: string
  hat: string
  beard: string
  screen: string
  led: string
}

function resolve(p: Palette): RPalette {
  return {
    ink: p.o,
    skin: p.s,
    skinShade: p.S,
    hair: p.h,
    hairHi: p.H,
    shirt: p.c,
    shirtShade: p.C,
    accent: p.a,
    white: p.w,
    dark: p.d,
    pants: p.p ?? p.d,
    shoes: p.b ?? p.o,
    eye: p.eye ?? p.a,
    hat: p.hat ?? p.h,
    beard: p.beard ?? p.h,
    screen: p.screen,
    led: p.led,
  }
}

function shade(hex: string, factor: number): string {
  const n = Number.parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * factor)))
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * factor)))
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * factor)))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function makeGrid(w: number, h: number): Grid {
  return Array.from({ length: h }, () => Array<string | null>(w).fill(null))
}

function put(g: Grid, x: number, y: number, color: string) {
  if (y < 0 || y >= g.length || x < 0 || x >= g[0].length) return
  g[y][x] = color
}

function box(g: Grid, x: number, y: number, w: number, h: number, color: string) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) put(g, xx, yy, color)
  }
}

function clearBox(g: Grid, x: number, y: number, w: number, h: number) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) put(g, xx, yy, null as unknown as string)
  }
}

/** A one-pixel ink silhouette around everything drawn so far. */
function addOutline(g: Grid, ink: string) {
  const h = g.length
  const w = g[0].length
  const edge: [number, number][] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!g[y][x]) continue
      if (y > 0 && !g[y - 1][x]) edge.push([x, y - 1])
      if (y < h - 1 && !g[y + 1][x]) edge.push([x, y + 1])
      if (x > 0 && !g[y][x - 1]) edge.push([x - 1, y])
      if (x < w - 1 && !g[y][x + 1]) edge.push([x + 1, y])
    }
  }
  for (const [x, y] of edge) if (!g[y][x]) g[y][x] = ink
}

function toRuns(g: Grid): SpriteRun[] {
  const runs: SpriteRun[] = []
  for (let y = 0; y < g.length; y++) {
    let x = 0
    while (x < g[0].length) {
      const color = g[y][x]
      if (!color) {
        x++
        continue
      }
      let w = 1
      while (x + w < g[0].length && g[y][x + w] === color) w++
      runs.push({ x, y, w, color })
      x += w
    }
  }
  return runs
}

function sleeveFor(outfit: Outfit): 'none' | 'short' | 'long' {
  if (outfit === 'tank' || outfit === 'tunic' || outfit === 'dress') return 'none'
  if (outfit === 'hoodie' || outfit === 'cardigan' || outfit === 'coat' || outfit === 'suit') return 'long'
  if (outfit === 'cyanJacket' || outfit === 'jacket') return 'long'
  return 'short'
}

function head(g: Grid, M: Metrics, p: RPalette) {
  const r = M.detail ? 2 : 1
  box(g, M.hx + r, M.hy, M.hw - r * 2, M.hh, p.skin)
  box(g, M.hx, M.hy + r, M.hw, M.hh - r, p.skin)
  clearBox(g, M.hx, M.hy, r, r)
  clearBox(g, M.hx + M.hw - r, M.hy, r, r)
  clearBox(g, M.hx, M.hy + M.hh - r, r, r)
  clearBox(g, M.hx + M.hw - r, M.hy + M.hh - r, r, r)
  // ears
  const earH = M.detail ? 5 : 3
  const earW = M.detail ? 3 : 2
  box(g, M.hx - 1, M.hy + Math.round(M.hh * 0.46), earW, earH, p.skin)
  box(g, M.hx + M.hw - earW + 1, M.hy + Math.round(M.hh * 0.46), earW, earH, p.skin)
  if (M.detail) {
    put(g, M.hx, M.hy + Math.round(M.hh * 0.46) + 2, p.skinShade)
    put(g, M.hx + M.hw - 1, M.hy + Math.round(M.hh * 0.46) + 2, p.skinShade)
    box(g, M.hx + M.hw - 2, M.hy + 2, 1, M.hh - 5, p.skinShade)
    box(g, M.hx + 3, M.hy + M.hh - 2, M.hw - 6, 1, p.skinShade)
  } else {
    box(g, M.hx + 2, M.hy + M.hh - 1, M.hw - 4, 1, p.skinShade)
  }
}

function face(g: Grid, M: Metrics, p: RPalette, open: boolean) {
  const eyeY = M.hy + Math.round(M.hh * 0.42)
  const eyeW = M.detail ? 3 : 2
  const left = M.hx + Math.round(M.hw * 0.2)
  const right = M.hx + Math.round(M.hw * 0.62)
  for (const ex of [left, right]) {
    box(g, ex, eyeY, eyeW, eyeW, p.white)
    if (M.detail) {
      box(g, ex + 1, eyeY + 1, 2, 2, p.eye)
      put(g, ex + 2, eyeY + 2, p.ink)
      put(g, ex, eyeY, p.white)
    } else {
      put(g, ex + 1, eyeY + 1, p.eye)
    }
  }
  // brows
  const browY = eyeY - 2
  box(g, left, browY, eyeW + 1, 1, p.hair)
  box(g, right - 1, browY, eyeW + 1, 1, p.hair)
  // nose
  const noseX = M.hx + Math.round(M.hw * 0.48)
  box(g, noseX, eyeY + 2, 1, M.detail ? 2 : 1, p.skinShade)
  // mouth
  const mouthY = M.hy + Math.round(M.hh * 0.72)
  if (open) {
    const mouthW = M.detail ? 6 : 4
    const mouthH = M.detail ? 3 : 2
    const mouthX = M.hx + Math.round((M.hw - mouthW) / 2)
    box(g, mouthX, mouthY - 1, mouthW, mouthH, p.ink)
    box(g, mouthX + 1, mouthY - 1, mouthW - 2, 1, p.white)
  } else {
    const mouthW = M.detail ? 5 : 3
    box(g, M.hx + Math.round((M.hw - mouthW) / 2), mouthY, mouthW, 1, p.ink)
    if (M.detail) box(g, M.hx + Math.round((M.hw - mouthW) / 2) + 1, mouthY + 1, mouthW - 2, 1, p.skinShade)
  }
}

/* ---------- hair and hats ---------- */

function hair(g: Grid, m: CrewMember, M: Metrics, p: RPalette) {
  const X = (f: number) => M.hx + Math.round(f * M.hw)
  const Y = (f: number) => M.hy + Math.round(f * M.hh)
  const W = (f: number) => Math.max(1, Math.round(f * M.hw))
  const H = (f: number) => Math.max(1, Math.round(f * M.hh))
  const style = m.hair

  switch (style) {
    case 'gingerMess': {
      box(g, X(-0.04), Y(-0.26), W(1.08), H(0.2), p.hair)
      box(g, X(0.08), Y(-0.34), W(0.14), H(0.12), p.hair)
      box(g, X(0.36), Y(-0.38), W(0.12), H(0.14), p.hair)
      box(g, X(0.68), Y(-0.32), W(0.16), H(0.1), p.hair)
      box(g, X(0), Y(-0.04), W(1), H(0.12), p.hair)
      box(g, X(0.04), Y(0.06), W(0.2), H(0.08), p.hair)
      box(g, X(0.56), Y(0.04), W(0.38), H(0.1), p.hair)
      box(g, X(-0.06), Y(0.04), W(0.1), H(0.36), p.hair)
      box(g, X(0.96), Y(0.04), W(0.1), H(0.36), p.hair)
      if (M.detail) {
        box(g, X(0.12), Y(-0.12), W(0.3), H(0.04), p.hairHi)
        box(g, X(0.58), Y(-0.04), W(0.16), H(0.04), p.hairHi)
      } else {
        box(g, X(0.16), Y(-0.1), W(0.2), H(0.04), p.hairHi)
      }
      // beard around the jaw, mouth stays clear
      box(g, X(0.06), Y(0.7), W(0.88), H(0.18), p.beard)
      box(g, X(0.02), Y(0.52), W(0.1), H(0.34), p.beard)
      box(g, X(0.88), Y(0.52), W(0.1), H(0.34), p.beard)
      box(g, X(0.32), Y(0.64), W(0.36), H(0.06), p.beard)
      return
    }
    case 'spikyMaroon':
    case 'spikyOrange':
    case 'spikyDark': {
      const tall = style === 'spikyMaroon'
      box(g, X(0), Y(-0.08), W(1), H(0.2), p.hair)
      for (let i = 0; i < 5; i++) {
        const x = X(0.02 + i * 0.19)
        const top = Y(tall ? -0.28 - (i % 2) * 0.12 : -0.22 - (i % 2) * 0.06)
        box(g, x, top, W(0.13), Y(0.06) - top, p.hair)
      }
      box(g, X(-0.06), Y(0.04), W(0.09), H(0.28), p.hair)
      box(g, X(0.97), Y(0.04), W(0.09), H(0.28), p.hair)
      if (M.detail) {
        box(g, X(0.2), Y(-0.16), W(0.12), H(0.05), p.hairHi)
        box(g, X(0.58), Y(-0.24), W(0.1), H(0.05), p.hairHi)
      } else {
        box(g, X(0.24), Y(-0.14), W(0.14), H(0.04), p.hairHi)
      }
      return
    }
    case 'cowboy': {
      box(g, X(-0.28), Y(0.1), W(1.56), H(0.1), p.hat)
      if (M.detail) box(g, X(-0.28), Y(0.18), W(1.56), H(0.03), shade(p.hat, 0.7))
      box(g, X(0.02), Y(-0.3), W(0.96), H(0.34), p.hat)
      box(g, X(0.1), Y(-0.38), W(0.8), H(0.12), p.hat)
      box(g, X(0.02), Y(0), W(0.96), H(0.07), p.accent)
      box(g, X(-0.02), Y(0.38), W(0.08), H(0.36), p.white)
      box(g, X(0.94), Y(0.38), W(0.08), H(0.36), p.white)
      if (M.detail) {
        box(g, X(0.16), Y(-0.26), W(0.24), H(0.04), p.white)
        box(g, X(0.06), Y(0.06), W(0.12), H(0.04), p.accent)
      }
      return
    }
    case 'pigtails': {
      box(g, X(-0.02), Y(-0.1), W(1.04), H(0.22), p.hair)
      box(g, X(-0.08), Y(0.02), W(0.12), H(0.52), p.hair)
      box(g, X(0.96), Y(0.02), W(0.12), H(0.52), p.hair)
      box(g, X(0.02), Y(0.02), W(0.96), H(0.12), p.hair)
      box(g, X(-0.36), Y(0.32), W(0.24), H(0.46), p.hair)
      box(g, X(1.12), Y(0.32), W(0.24), H(0.46), p.hair)
      box(g, X(-0.36), Y(0.3), W(0.24), H(0.06), p.accent)
      box(g, X(1.12), Y(0.3), W(0.24), H(0.06), p.accent)
      if (M.detail) {
        box(g, X(0.12), Y(-0.06), W(0.24), H(0.04), p.hairHi)
        box(g, X(0.58), Y(-0.02), W(0.18), H(0.04), p.hairHi)
      } else {
        box(g, X(0.18), Y(-0.04), W(0.18), H(0.04), p.hairHi)
      }
      return
    }
    case 'hood': {
      // hood frame, drawn on top of the head; the face stays uncovered
      box(g, X(-0.18), Y(-0.24), W(1.36), H(0.26), p.shirt)
      box(g, X(-0.18), Y(0.02), W(0.2), H(0.86), p.shirt)
      box(g, X(0.98), Y(0.02), W(0.2), H(0.86), p.shirt)
      box(g, X(-0.18), Y(0.84), W(1.36), H(0.18), p.shirt)
      box(g, X(0.02), Y(0), W(0.96), H(0.04), p.shirtShade)
      box(g, X(0.02), Y(0.02), W(0.04), H(0.8), p.shirtShade)
      box(g, X(0.94), Y(0.02), W(0.04), H(0.8), p.shirtShade)
      box(g, X(0.36), Y(0.92), W(0.04), H(0.22), p.accent)
      box(g, X(0.6), Y(0.92), W(0.04), H(0.22), p.accent)
      return
    }
    case 'capRed':
    case 'capGrey':
    case 'cap': {
      box(g, X(-0.02), Y(-0.22), W(1.04), H(0.28), p.accent)
      box(g, X(-0.14), Y(0.04), W(1.28), H(0.1), shade(p.accent, 0.6))
      box(g, X(0.3), Y(-0.2), W(0.4), H(0.16), p.white)
      box(g, X(-0.04), Y(0.1), W(0.08), H(0.26), p.hair)
      box(g, X(0.96), Y(0.1), W(0.08), H(0.26), p.hair)
      if (M.detail) box(g, X(0.08), Y(-0.16), W(0.1), H(0.06), shade(p.accent, 1.3))
      return
    }
    case 'jock': {
      box(g, X(-0.02), Y(-0.1), W(1.04), H(0.22), p.hair)
      box(g, X(0.06), Y(-0.16), W(0.4), H(0.1), p.hair)
      box(g, X(-0.04), Y(0.02), W(0.08), H(0.28), p.hair)
      box(g, X(0.96), Y(0.02), W(0.08), H(0.28), p.hair)
      if (M.detail) box(g, X(0.16), Y(-0.06), W(0.2), H(0.04), p.hairHi)
      return
    }
    case 'hornedHelmet': {
      box(g, X(-0.28), Y(-0.14), W(0.3), H(0.2), p.white)
      box(g, X(-0.34), Y(-0.24), W(0.2), H(0.12), p.white)
      box(g, X(0.98), Y(-0.14), W(0.3), H(0.2), p.white)
      box(g, X(1.14), Y(-0.24), W(0.2), H(0.12), p.white)
      box(g, X(-0.02), Y(-0.2), W(1.04), H(0.34), p.hat)
      box(g, X(0.02), Y(0.1), W(0.96), H(0.07), p.dark)
      box(g, X(-0.02), Y(0.14), W(0.1), H(0.26), p.hair)
      box(g, X(0.92), Y(0.14), W(0.1), H(0.26), p.hair)
      if (M.detail) {
        box(g, X(0.2), Y(-0.14), W(0.18), H(0.05), p.white)
        put(g, X(0.4), Y(0.02), p.accent)
        put(g, X(0.6), Y(0.02), p.accent)
      }
      return
    }
    case 'long': {
      box(g, X(-0.02), Y(-0.12), W(1.04), H(0.2), p.hair)
      box(g, X(-0.1), Y(0.02), W(0.16), H(1.2), p.hair)
      box(g, X(0.94), Y(0.02), W(0.16), H(1.2), p.hair)
      box(g, X(0.02), Y(0.02), W(0.96), H(0.12), p.hair)
      if (M.detail) {
        box(g, X(0.02), Y(0.3), W(0.05), H(0.8), p.hairHi)
        box(g, X(0.94), Y(0.3), W(0.05), H(0.8), p.hairHi)
      }
      return
    }
    case 'flatTop': {
      box(g, X(-0.02), Y(-0.24), W(1.04), H(0.26), p.hair)
      box(g, X(-0.02), Y(-0.02), W(0.08), H(0.2), p.hair)
      box(g, X(0.96), Y(-0.02), W(0.08), H(0.2), p.hair)
      if (M.detail) {
        box(g, X(0.06), Y(-0.2), W(0.46), H(0.04), p.hairHi)
      } else {
        box(g, X(0.1), Y(-0.2), W(0.3), H(0.04), p.hairHi)
      }
      return
    }
    case 'bobBand': {
      box(g, X(-0.02), Y(-0.08), W(1.04), H(0.2), p.hair)
      box(g, X(-0.08), Y(0.04), W(0.12), H(0.6), p.hair)
      box(g, X(0.96), Y(0.04), W(0.12), H(0.6), p.hair)
      box(g, X(0.02), Y(0.02), W(0.96), H(0.12), p.hair)
      box(g, X(0.02), Y(0.02), W(0.96), H(0.08), p.accent)
      if (M.detail) {
        box(g, X(0.14), Y(-0.04), W(0.22), H(0.04), p.hairHi)
      } else {
        box(g, X(0.18), Y(-0.02), W(0.18), H(0.04), p.hairHi)
      }
      return
    }
    default: {
      box(g, X(-0.02), Y(-0.1), W(1.04), H(0.22), p.hair)
      box(g, X(-0.04), Y(0.02), W(0.08), H(0.28), p.hair)
      box(g, X(0.96), Y(0.02), W(0.08), H(0.28), p.hair)
      return
    }
  }
}

/* ---------- outfits ---------- */

function logo(g: Grid, kind: CrewMember['logo'], color: string, cx: number, y: number) {
  if (!kind) return
  if (kind === 'M') {
    box(g, cx - 3, y, 1, 3, color)
    put(g, cx - 2, y + 1, color)
    put(g, cx - 1, y + 2, color)
    put(g, cx, y + 1, color)
    box(g, cx + 1, y, 1, 3, color)
  } else if (kind === 'square') {
    box(g, cx - 1, y, 3, 2, color)
  } else if (kind === 'bolt') {
    put(g, cx + 1, y - 1, color)
    put(g, cx, y, color)
    put(g, cx + 1, y, color)
    put(g, cx, y + 1, color)
    put(g, cx + 1, y + 2, color)
  } else {
    box(g, cx - 1, y, 3, 1, color)
    put(g, cx, y - 1, color)
    put(g, cx, y + 1, color)
  }
}

function torso(
  g: Grid,
  m: CrewMember,
  M: Metrics,
  p: RPalette,
  bx: number,
  bw: number,
  center: number,
) {
  const by = M.by
  const bh = M.bh
  const base = (color: string, inset = 1) => {
    box(g, bx + inset, by, bw - inset * 2, bh, color)
    box(g, bx, by + inset, bw, bh - inset, color)
  }
  const detail = M.detail

  switch (m.outfit) {
    case 'tank': {
      base(p.shirt, 2)
      box(g, bx, by, 3, 2, p.skin)
      box(g, bx + bw - 3, by, 3, 2, p.skin)
      box(g, bx + 2, by, 2, 5, p.shirt)
      box(g, bx + bw - 4, by, 2, 5, p.shirt)
      box(g, bx + 5, by, bw - 10, 2, p.skin)
      if (detail) {
        box(g, bx + 2, by + 5, 2, 1, p.shirtShade)
        box(g, bx + bw - 4, by + 5, 2, 1, p.shirtShade)
        box(g, bx + bw - 4, by + 1, 1, bh - 2, p.shirtShade)
      }
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.4))
      break
    }
    case 'dress': {
      base(p.shirt)
      // white collar and accent belt
      box(g, bx + 4, by, bw - 8, 1, p.white)
      box(g, bx + 2, by, 2, 1, p.white)
      box(g, bx + bw - 4, by, 2, 1, p.white)
      box(g, center - 1, by + 1, 2, 2, p.accent)
      // flared skirt over the upper legs
      const skirtY = M.legY - 2
      const skirtW = bw + 4
      const skirtX = center - Math.floor(skirtW / 2)
      for (let i = 0; i < 6; i++) {
        box(g, skirtX + (i < 2 ? 0 : 0), skirtY - 2 + i, skirtW, 1, p.shirt)
      }
      box(g, skirtX, skirtY + 4, skirtW, 1, p.shirtShade)
      if (detail) {
        box(g, skirtX + 1, skirtY + 1, 2, 5, p.shirtShade)
        box(g, skirtX + skirtW - 3, skirtY + 1, 2, 5, p.shirtShade)
      }
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.42))
      break
    }
    case 'cardigan': {
      base(p.shirt)
      box(g, bx + 3, by + 1, bw - 6, bh - 1, p.white)
      box(g, bx + 3, by + 3, bw - 6, Math.max(2, Math.round(bh * 0.16)), p.accent)
      box(g, bx + 2, by, bw - 4, 1, p.white)
      box(g, bx + 3, by, 1, 3, p.white)
      box(g, bx + bw - 4, by, 1, 3, p.white)
      box(g, bx, by + 1, 2, bh - 1, p.shirtShade)
      box(g, bx + bw - 2, by + 1, 2, bh - 1, p.shirtShade)
      if (detail) {
        box(g, center - 1, by + 6, 1, 1, p.dark)
        box(g, center - 1, by + 9, 1, 1, p.dark)
      }
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.45))
      break
    }
    case 'hoodie': {
      base(p.shirt)
      box(g, bx + 4, by + bh - 3, bw - 8, 2, p.shirtShade)
      box(g, bx + 4, by + bh - 3, 1, 2, p.shirt)
      box(g, bx + bw - 5, by + bh - 3, 1, 2, p.shirt)
      box(g, bx + 2, by, 1, 3, p.shirtShade)
      box(g, bx + bw - 3, by, 1, 3, p.shirtShade)
      if (detail) {
        box(g, bx + 3, by + 2, 1, 4, p.white)
        box(g, bx + bw - 4, by + 2, 1, 4, p.white)
      }
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.4))
      break
    }
    case 'suit': {
      base(p.shirt)
      box(g, bx + 3, by + 1, bw - 6, bh - 2, p.white)
      box(g, center - 3, by + 1, 6, 4, p.white)
      box(g, center - 1, by + 1, 2, 5, p.accent)
      box(g, center - 2, by + 6, 4, 1, p.accent)
      box(g, bx + 1, by + 1, 2, bh - 2, p.shirtShade)
      box(g, bx + bw - 3, by + 1, 2, bh - 2, p.shirtShade)
      if (detail) {
        box(g, bx + 4, by + 6, 2, 1, p.shirtShade)
        box(g, bx + bw - 6, by + 6, 2, 1, p.shirtShade)
      }
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.58))
      break
    }
    case 'coat': {
      base(p.shirt)
      // long coat over the upper legs
      box(g, bx - 1, by + bh - 2, bw + 2, M.legY - (by + bh) + 5, p.shirt)
      box(g, bx + 3, by + 1, bw - 6, bh - 1, p.white)
      box(g, center - 1, by + 1, 2, 6, p.accent)
      box(g, bx, by + 1, 2, bh + 3, p.shirtShade)
      box(g, bx + bw - 2, by + 1, 2, bh + 3, p.shirtShade)
      box(g, bx - 1, by + bh - 2, 1, M.legY - (by + bh) + 5, p.shirtShade)
      box(g, bx + bw, by + bh - 2, 1, M.legY - (by + bh) + 5, p.shirtShade)
      if (detail) {
        box(g, center - 4, by + 7, 1, 1, p.dark)
        box(g, center + 3, by + 7, 1, 1, p.dark)
      }
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.62))
      break
    }
    case 'tunic': {
      base(p.shirt)
      box(g, bx + 4, by + 1, bw - 8, bh - 3, p.white)
      box(g, bx, by + bh - 3, bw, 2, p.dark)
      box(g, center - 1, by + bh - 3, 2, 2, p.accent)
      if (detail) {
        box(g, bx, by + 1, 2, bh - 4, p.shirtShade)
        box(g, bx + bw - 2, by + 1, 2, bh - 4, p.shirtShade)
      }
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.4))
      break
    }
    case 'baseball': {
      base(p.white)
      box(g, center, by + 1, 1, bh - 2, p.shirtShade)
      box(g, bx, by + bh - 2, bw, 2, p.accent)
      box(g, bx + 2, by, 1, 2, p.accent)
      box(g, bx + bw - 3, by, 1, 2, p.accent)
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.34))
      break
    }
    case 'cyanJacket': {
      base(p.shirt)
      box(g, bx + 4, by + 1, bw - 8, bh - 1, p.white)
      box(g, center - 1, by + 1, 2, bh - 1, p.accent)
      box(g, bx + 2, by, bw - 4, 1, p.accent)
      box(g, bx, by + 1, 2, bh - 1, p.shirtShade)
      box(g, bx + bw - 2, by + 1, 2, bh - 1, p.shirtShade)
      if (detail) {
        box(g, bx + 4, by + 4, 2, 1, p.shirtShade)
        box(g, bx + bw - 6, by + 4, 2, 1, p.shirtShade)
      }
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.48))
      break
    }
    case 'jacket': {
      base(p.shirt)
      box(g, bx + 4, by + 1, bw - 8, bh - 2, p.white)
      box(g, bx + 4, by + 1, bw - 8, 2, p.accent)
      box(g, bx, by + 1, 2, bh - 1, p.shirtShade)
      box(g, bx + bw - 2, by + 1, 2, bh - 1, p.shirtShade)
      if (detail) {
        box(g, center - 1, by + 4, 1, 4, p.shirtShade)
      }
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.5))
      break
    }
    case 'dressShirt': {
      base(p.shirt)
      box(g, bx + 2, by, 2, 1, p.white)
      box(g, bx + bw - 4, by, 2, 1, p.white)
      box(g, center - 1, by, 2, 1, p.dark)
      box(g, center - 1, by + 1, 1, 4, p.accent)
      box(g, center, by + 4, 2, 1, p.accent)
      box(g, bx + bw - 3, by + 1, 1, bh - 2, p.shirtShade)
      if (detail) {
        box(g, center + 1, by + 2, 1, 3, shade(p.accent, 0.7))
        box(g, bx + 4, by + 6, 1, 1, p.dark)
      }
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.58))
      break
    }
    case 'vest': {
      base(p.white)
      box(g, bx + 1, by + 1, 3, bh - 2, p.shirt)
      box(g, bx + bw - 4, by + 1, 3, bh - 2, p.shirt)
      box(g, bx + 4, by, bw - 8, 3, p.white)
      box(g, center - 1, by + 3, 1, 5, p.shirtShade)
      if (detail) {
        box(g, center - 2, by + 4, 1, 1, p.accent)
        box(g, center, by + 6, 1, 1, p.accent)
      }
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.45))
      break
    }
    default: {
      // tee / shirt: a plain tee with a crew neck and print
      base(p.shirt)
      box(g, center - 2, by, 4, 1, p.dark)
      box(g, bx, by + bh - 1, bw, 1, p.shirtShade)
      if (detail) box(g, bx + bw - 3, by + 1, 1, bh - 2, p.shirtShade)
      logo(g, m.logo, p.accent, center, by + Math.round(bh * 0.4))
    }
  }
}

function arms(
  g: Grid,
  m: CrewMember,
  M: Metrics,
  p: RPalette,
  bx: number,
  bw: number,
) {
  const outfit = m.outfit
  const sleeve = sleeveFor(outfit)
  const armY = M.by + 1
  const armH = M.legY - armY - 1
  const handH = M.detail ? 4 : 3
  const sleeveLen =
    sleeve === 'none' ? 0 : sleeve === 'short' ? Math.max(2, Math.round(armH * 0.34)) : armH - handH
  const sleeveColor = outfit === 'baseball' ? p.accent : p.shirt
  const armW = M.armW
  const leftX = bx - armW - 1
  const rightX = bx + bw + 1

  for (const x of [leftX, rightX]) {
    if (sleeveLen > 0) box(g, x, armY, armW, sleeveLen, sleeveColor)
    box(g, x, armY + sleeveLen, armW, armH - sleeveLen, p.skin)
    if (M.detail) {
      if (sleeveLen > 0) box(g, x, armY + sleeveLen - 1, armW, 1, p.shirtShade)
      box(g, x + armW - 1, armY + sleeveLen, 1, armH - sleeveLen, p.skinShade)
      put(g, x + (x === leftX ? armW - 1 : 0), armY + armH - 1, p.skinShade)
    }
    // shoulder seam
    if (sleeveLen > 0) box(g, x, armY, armW, 1, shade(sleeveColor, 1.15))
  }
}

function accessories(g: Grid, m: CrewMember, M: Metrics, p: RPalette) {
  const X = (f: number) => M.hx + Math.round(f * M.hw)
  const Y = (f: number) => M.hy + Math.round(f * M.hh)
  const W = (f: number) => Math.max(1, Math.round(f * M.hw))
  const H = (f: number) => Math.max(1, Math.round(f * M.hh))

  switch (m.accessory) {
    case 'headphones': {
      box(g, X(-0.16), Y(0.34), W(0.18), H(0.3), p.accent)
      box(g, X(0.98), Y(0.34), W(0.18), H(0.3), p.accent)
      if (M.detail) {
        box(g, X(-0.14), Y(0.38), W(0.14), H(0.22), p.dark)
        box(g, X(1), Y(0.38), W(0.14), H(0.22), p.dark)
      }
      box(g, X(0.02), Y(-0.12), W(0.96), H(0.05), p.dark)
      break
    }
    case 'earring': {
      put(g, X(0.99), Y(0.62), p.accent)
      if (M.detail) put(g, X(0.99), Y(0.66), shade(p.accent, 1.2))
      break
    }
    case 'handlebar': {
      box(g, X(0.28), Y(0.64), W(0.44), H(0.05), p.white)
      put(g, X(0.22), Y(0.64), p.white)
      put(g, X(0.78), Y(0.64), p.white)
      put(g, X(0.18), Y(0.7), p.white)
      put(g, X(0.82), Y(0.7), p.white)
      break
    }
    case 'mustache': {
      box(g, X(0.3), Y(0.65), W(0.4), H(0.05), p.hair)
      put(g, X(0.24), Y(0.65), p.hair)
      put(g, X(0.76), Y(0.65), p.hair)
      break
    }
    case 'goatee': {
      box(g, X(0.4), Y(0.82), W(0.2), H(0.1), p.beard)
      break
    }
    case 'stubble': {
      for (let i = 0; i < 5; i++) put(g, X(0.2 + i * 0.14), Y(0.82 + (i % 2) * 0.04), p.hair)
      break
    }
    default:
      break
  }

  if (m.cigar) {
    const cy = Y(0.72)
    box(g, X(0.56), cy, W(0.34), M.detail ? 2 : 1, '#6b3f1c')
    put(g, X(0.9), cy, '#e23b2e')
    put(g, X(0.94), cy, '#f2a03d')
    if (M.detail) {
      put(g, X(0.92), cy - 1, '#b0b0b0')
      put(g, X(0.96), cy - 2, '#8a8a8a')
    }
  }
}

function robotHead(g: Grid, M: Metrics, p: RPalette) {
  const { hx, hy, hw, hh } = M
  box(g, hx + 1, hy, hw - 2, hh, p.hat)
  box(g, hx, hy + 1, hw, hh - 2, p.hat)
  clearBox(g, hx, hy, 1, 1)
  clearBox(g, hx + hw - 1, hy, 1, 1)
  // screen
  box(g, hx + 2, hy + 3, hw - 4, hh - 7, p.dark)
  box(g, hx + 3, hy + 4, hw - 6, hh - 9, p.screen)
  // eyes and mouth
  const eyeY = hy + Math.round(hh * 0.42)
  box(g, hx + 4, eyeY, M.detail ? 3 : 2, M.detail ? 2 : 1, p.led)
  box(g, hx + hw - 7, eyeY, M.detail ? 3 : 2, M.detail ? 2 : 1, p.led)
  box(g, hx + 5, hy + hh - 5, hw - 10, 1, p.led)
  // antenna and bolts
  box(g, hx + Math.round(hw / 2), hy - 2, 1, 2, p.dark)
  put(g, hx + Math.round(hw / 2), hy - 2, p.led)
  box(g, hx - 1, hy + 5, 2, 3, p.dark)
  box(g, hx + hw - 1, hy + 5, 2, 3, p.dark)
  if (M.detail) {
    put(g, hx + 3, hy + 2, p.white)
    put(g, hx + hw - 4, hy + hh - 3, p.white)
  }
}

/* ---------- assembly ---------- */

export function drawCrewSprite(m: CrewMember, style: PixelStyle, mouthOpen = false): PreviewSprite {
  const M = style === '8bit' ? M8 : M16
  const g = makeGrid(M.W, M.H)
  const p = resolve(m.palette)
  const build = m.build ?? 'normal'
  const bw = M.bw + (build === 'wide' ? 2 : build === 'slim' ? -2 : 0)
  const bx = Math.floor((M.W - bw) / 2)
  const center = M.W / 2
  const legW = (M.detail ? 7 : 5) + (build === 'wide' ? 1 : build === 'slim' ? -1 : 0)
  const legGap = 1
  const lx = Math.floor((M.W - (legW * 2 + legGap)) / 2)
  const outfit = m.outfit
  const isDress = outfit === 'dress'

  // legs and shoes
  const shoeY = M.legY + M.legH
  if (!isDress) {
    box(g, lx, M.legY, legW, M.legH, p.pants)
    box(g, lx + legW + legGap, M.legY, legW, M.legH, p.pants)
    if (M.detail) {
      box(g, lx + legW - 1, M.legY, 1, M.legH, shade(p.pants, 0.7))
      box(g, lx + legW + legGap, M.legY, 1, M.legH, shade(p.pants, 0.7))
      box(g, lx + legW + legGap + legW - 1, M.legY, 1, M.legH, shade(p.pants, 0.7))
    }
    box(g, lx - 1, shoeY, legW + 2, M.shoeH, p.shoes)
    box(g, lx + legW + legGap - 1, shoeY, legW + 2, M.shoeH, p.shoes)
    if (M.detail) {
      box(g, lx - 1, shoeY + M.shoeH - 1, legW + 2, 1, shade(p.shoes, 0.55))
      box(g, lx + legW + legGap - 1, shoeY + M.shoeH - 1, legW + 2, 1, shade(p.shoes, 0.55))
    }
  } else {
    box(g, lx + 1, M.legY, legW - 1, M.legH, p.skin)
    box(g, lx + legW + legGap, M.legY, legW - 1, M.legH, p.skin)
    if (M.detail) {
      box(g, lx + legW - 1, M.legY, 1, M.legH, p.skinShade)
      box(g, lx + legW + legGap + legW - 2, M.legY, 1, M.legH, p.skinShade)
    }
    box(g, lx, shoeY, legW + 1, M.shoeH, p.shoes)
    box(g, lx + legW + legGap, shoeY, legW + 1, M.shoeH, p.shoes)
    if (M.detail) {
      box(g, lx, shoeY + M.shoeH - 1, legW + 1, 1, shade(p.shoes, 0.55))
      box(g, lx + legW + legGap, shoeY + M.shoeH - 1, legW + 1, 1, shade(p.shoes, 0.55))
    }
  }

  // neck
  box(g, Math.round(center - (M.detail ? 3 : 2)), M.hy + M.hh - 1, M.detail ? 6 : 4, M.by - (M.hy + M.hh) + 3, p.skin)

  torso(g, m, M, p, bx, bw, center)
  arms(g, m, M, p, bx, bw)

  if (m.hair === 'robot') {
    robotHead(g, M, p)
  } else {
    head(g, M, p)
    hair(g, m, M, p)
    face(g, M, p, mouthOpen)
    accessories(g, m, M, p)
  }

  addOutline(g, p.ink)
  return { w: M.W, h: M.H, runs: toRuns(g) }
}
