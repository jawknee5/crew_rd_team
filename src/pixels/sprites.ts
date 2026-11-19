import type { Accessory, ChestLogo, CrewId, CrewMember, HairStyle, Outfit, Palette, SpriteBuild } from '../data/crew'
import { CREW_BY_ID } from '../data/crew'

export const SPRITE_W = 20
export const SPRITE_H = 20

type Grid = string[][]
const TRANSPARENT = '.'

type RPalette = Palette & { p: string; b: string; eye: string; hat: string; beard: string }

function resolve(p: Palette): RPalette {
  return {
    ...p,
    p: p.p ?? p.d,
    b: p.b ?? p.o,
    eye: p.eye ?? p.a,
    hat: p.hat ?? p.h,
    beard: p.beard ?? p.h,
  }
}

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

/* The show draws its cast as chibi: a huge square head on a short body,
   everything closed with a one-pixel black outline. */

function drawHead(g: Grid, p: RPalette) {
  // ears
  put(g, 3, 5, p.o)
  put(g, 16, 5, p.o)
  // head shell
  fill(g, 4, 1, 12, 10, p.o)
  fill(g, 5, 2, 10, 8, p.s)
  // jaw shade
  fill(g, 5, 9, 10, 1, p.S)
  // eyes: white sclera, coloured iris, black pupil
  fill(g, 6, 5, 2, 2, p.w)
  fill(g, 11, 5, 2, 2, p.w)
  put(g, 7, 5, p.eye)
  put(g, 12, 5, p.eye)
  put(g, 7, 6, p.o)
  put(g, 12, 6, p.o)
  // brows
  put(g, 6, 4, p.h)
  put(g, 7, 4, p.h)
  put(g, 11, 4, p.h)
  put(g, 12, 4, p.h)
  // nose
  put(g, 9, 7, p.S)
  put(g, 10, 7, p.S)
}

function drawMouth(g: Grid, p: Palette, open: boolean) {
  if (open) {
    fill(g, 8, 8, 4, 2, p.d)
    fill(g, 9, 8, 2, 1, '#f2f2f2')
  } else {
    fill(g, 8, 8, 4, 1, p.d)
  }
}

function armSpan(build: SpriteBuild) {
  if (build === 'wide') return { x: 2, w: 16, tx: 4, tw: 12 }
  if (build === 'slim') return { x: 4, w: 12, tx: 6, tw: 8 }
  return { x: 3, w: 14, tx: 5, tw: 10 }
}

function drawSleeves(g: Grid, p: RPalette, build: SpriteBuild, skin: 'short' | 'long' | 'none', colour: string) {
  const { x, w } = armSpan(build)
  if (skin === 'none') {
    // bare arms, with a shoulder cap so the torso still has a silhouette
    fill(g, x + 1, 13, 2, 4, p.s)
    fill(g, x + 1, 13, 2, 1, colour)
    fill(g, x + w - 3, 13, 2, 4, p.s)
    fill(g, x + w - 3, 13, 2, 1, colour)
    return
  }
  const sleeve = skin === 'long' ? 4 : 2
  fill(g, x + 1, 13, 2, sleeve, colour)
  fill(g, x + w - 3, 13, 2, sleeve, colour)
  fill(g, x + 1, 13 + sleeve, 2, 4 - sleeve, p.s)
  fill(g, x + w - 3, 13 + sleeve, 2, 4 - sleeve, p.s)
}

function drawLogo(g: Grid, kind: ChestLogo | undefined, colour: string, cx: number) {
  if (!kind) return
  if (kind === 'M') {
    fill(g, cx - 2, 14, 1, 2, colour)
    put(g, cx - 1, 15, colour)
    put(g, cx, 14, colour)
    put(g, cx + 1, 15, colour)
    fill(g, cx + 2, 14, 1, 2, colour)
  } else if (kind === 'square') {
    fill(g, cx - 1, 14, 3, 2, colour)
  } else if (kind === 'bolt') {
    put(g, cx + 1, 13, colour)
    put(g, cx, 14, colour)
    put(g, cx + 1, 14, colour)
    put(g, cx, 15, colour)
    put(g, cx + 1, 16, colour)
  } else if (kind === 'star') {
    fill(g, cx - 1, 14, 3, 1, colour)
    put(g, cx, 13, colour)
    put(g, cx, 15, colour)
  }
}

function drawBody(g: Grid, p: RPalette, m: CrewMember) {
  const build = m.build ?? 'normal'
  const { x, w, tx, tw } = armSpan(build)
  const cx = tx + Math.floor(tw / 2)

  // neck
  fill(g, 8, 10, 4, 2, p.S)
  fill(g, 8, 10, 4, 1, p.s)

  // blocky shoulders and short body
  fill(g, x, 12, w, 6, p.o)
  fill(g, x + 1, 12, w - 2, 5, p.c)

  const outfit: Outfit = m.outfit

  if (outfit === 'shirt') {
    drawSleeves(g, p, build, 'short', p.c)
    fill(g, tx, 12, tw, 4, p.c)
    fill(g, tx, 12, tw, 1, p.C)
    fill(g, tx + 2, 12, tw - 4, 1, p.S)
    drawLogo(g, m.logo, m.accent, cx)
    if (!m.logo) fill(g, cx - 2, 14, 4, 2, m.accent)
  } else if (outfit === 'dressShirt') {
    // short-sleeve white dress shirt, red tie: Dean's college-bro gym look
    drawSleeves(g, p, build, 'short', p.c)
    fill(g, tx, 12, tw, 5, p.c)
    fill(g, tx, 12, 2, 1, p.C)
    fill(g, tx + tw - 2, 12, 2, 1, p.C)
    fill(g, tx + 2, 12, tw - 4, 1, p.w)
    // collar points and a red tie with a darker knot
    put(g, tx + 2, 13, p.w)
    put(g, tx + tw - 3, 13, p.w)
    fill(g, cx - 1, 12, 2, 1, p.a)
    put(g, cx - 1, 13, p.d)
    fill(g, cx, 13, 1, 3, p.a)
    put(g, cx, 16, p.d)
    // broad chest shading under the shirt
    fill(g, tx + 2, 15, 2, 1, p.C)
    fill(g, tx + tw - 4, 15, 2, 1, p.C)
    drawLogo(g, m.logo, p.a, cx)
  } else if (outfit === 'tee') {
    drawSleeves(g, p, build, 'short', p.c)
    fill(g, tx, 12, tw, 4, p.c)
    fill(g, tx, 12, tw, 1, p.C)
    fill(g, tx + 2, 12, tw - 4, 1, p.S)
    drawLogo(g, m.logo, p.a, cx)
  } else if (outfit === 'cardigan') {
    drawSleeves(g, p, build, 'long', p.c)
    fill(g, tx, 12, tw, 4, p.c)
    // open cardigan: yellow shirt, one blue stripe, white collar
    fill(g, tx + 2, 12, tw - 4, 4, p.w)
    fill(g, tx + 2, 13, tw - 4, 1, p.a)
    fill(g, tx + 2, 12, tw - 4, 1, p.C)
    put(g, tx + 3, 12, p.w)
    put(g, tx + tw - 4, 12, p.w)
    fill(g, tx, 12, 2, 5, p.c)
    fill(g, tx + tw - 2, 12, 2, 5, p.c)
    drawLogo(g, m.logo, p.a, cx)
  } else if (outfit === 'tunic') {
    drawSleeves(g, p, build, 'none', p.c)
    fill(g, tx, 12, tw, 5, p.c)
    fill(g, tx + 2, 12, tw - 4, 4, p.w)
    fill(g, tx, 15, tw, 1, p.d)
    fill(g, tx + 1, 16, tw - 2, 1, p.d)
    put(g, cx - 2, 14, p.a)
    put(g, cx + 2, 14, p.a)
    drawLogo(g, m.logo, p.a, cx)
  } else if (outfit === 'baseball') {
    drawSleeves(g, p, build, 'short', p.a)
    fill(g, tx, 12, tw, 4, p.c)
    fill(g, tx, 12, tw, 1, p.a)
    fill(g, tx + 2, 12, tw - 4, 1, p.S)
    drawLogo(g, m.logo, p.a, cx)
    fill(g, tx, 15, tw, 1, p.C)
  } else if (outfit === 'cyanJacket') {
    drawSleeves(g, p, build, 'long', p.c)
    fill(g, tx, 12, tw, 4, p.c)
    fill(g, tx + 2, 12, tw - 4, 4, p.w)
    fill(g, tx + 1, 12, 1, 4, p.a)
    fill(g, tx + tw - 2, 12, 1, 4, p.a)
    fill(g, tx + 2, 12, tw - 4, 1, p.a)
    fill(g, cx, 13, 2, 3, p.a)
    drawLogo(g, m.logo, p.a, cx)
  } else if (outfit === 'suit') {
    drawSleeves(g, p, build, 'long', p.c)
    fill(g, tx, 12, tw, 4, p.c)
    fill(g, tx + 2, 12, tw - 4, 4, p.w)
    fill(g, cx - 1, 12, 2, 4, p.a)
    fill(g, cx - 1, 15, 3, 1, p.a)
    fill(g, tx + 1, 12, 1, 1, p.C)
    fill(g, tx + tw - 2, 12, 1, 1, p.C)
    drawLogo(g, m.logo, p.a, cx)
  } else if (outfit === 'tank') {
    drawSleeves(g, p, build, 'none', p.c)
    fill(g, tx, 12, tw, 4, p.c)
    fill(g, tx + 2, 12, tw - 4, 1, p.S)
    fill(g, tx, 15, tw, 1, p.C)
    drawLogo(g, m.logo, p.a, cx)
  } else if (outfit === 'dress') {
    // puffed sleeves, bodice, flared skirt
    fill(g, x + 1, 13, 2, 2, p.c)
    fill(g, x + w - 3, 13, 2, 2, p.c)
    fill(g, x + 1, 15, 2, 2, p.s)
    fill(g, x + w - 3, 15, 2, 2, p.s)
    fill(g, tx, 12, tw, 4, p.c)
    fill(g, tx + 2, 12, tw - 4, 1, p.w)
    fill(g, cx - 1, 13, 2, 2, m.accent)
    drawLogo(g, m.logo, p.a, cx)
    fill(g, tx, 15, tw, 1, p.C)
    fill(g, x + 1, 16, w - 2, 2, p.c)
    fill(g, x + 2, 16, w - 4, 1, p.C)
  } else if (outfit === 'vest') {
    drawSleeves(g, p, build, 'short', p.w)
    fill(g, tx, 12, tw, 4, p.w)
    fill(g, tx, 12, 2, 5, p.c)
    fill(g, tx + tw - 2, 12, 2, 5, p.c)
    fill(g, tx + 2, 12, tw - 4, 1, p.S)
    put(g, tx + 3, 14, p.a)
    put(g, tx + 3, 15, p.a)
    put(g, tx + tw - 4, 14, p.a)
    put(g, tx + tw - 4, 15, p.a)
    drawLogo(g, m.logo, p.a, cx)
  } else if (outfit === 'coat') {
    drawSleeves(g, p, build, 'long', p.c)
    fill(g, tx, 12, tw, 5, p.c)
    fill(g, tx + 2, 12, tw - 4, 4, p.w)
    fill(g, cx - 1, 12, 2, 4, m.accent)
    fill(g, tx, 12, 2, 5, p.C)
    fill(g, tx + tw - 2, 12, 2, 5, p.C)
    drawLogo(g, m.logo, p.a, cx)
  } else if (outfit === 'hoodie') {
    drawSleeves(g, p, build, 'long', p.c)
    fill(g, tx, 12, tw, 5, p.c)
    fill(g, tx, 12, tw, 1, p.C)
    fill(g, tx + 1, 15, tw - 2, 2, p.C)
    put(g, tx + 3, 16, p.a)
    put(g, tx + tw - 4, 16, p.a)
    drawLogo(g, m.logo, p.a, cx)
  } else if (outfit === 'jacket') {
    drawSleeves(g, p, build, 'long', p.c)
    fill(g, tx, 12, tw, 5, p.c)
    fill(g, tx + 2, 12, tw - 4, 4, p.w)
    fill(g, tx + 2, 12, tw - 4, 1, m.accent)
    fill(g, tx + 1, 12, 1, 5, p.C)
    fill(g, tx + tw - 2, 12, 1, 5, p.C)
    drawLogo(g, m.logo, p.a, cx)
  } else if (outfit === 'robot') {
    fill(g, x, 12, w, 5, p.o)
    fill(g, x + 1, 12, w - 2, 4, p.w)
    fill(g, tx, 13, tw, 3, p.d)
    put(g, cx - 1, 14, p.led)
    put(g, cx + 2, 14, p.led)
    fill(g, tx, 16, tw, 1, p.a)
  }

  // trousers (a dress gets bare legs instead)
  if (outfit === 'dress') {
    fill(g, tx + 1, 18, 2, 1, p.s)
    fill(g, tx + tw - 3, 18, 2, 1, p.s)
  } else {
    fill(g, tx, 17, tw, 2, p.o)
    fill(g, tx + 1, 17, tw - 2, 2, p.p)
    fill(g, cx, 17, 1, 2, p.o)
  }
  // shoes
  fill(g, tx + 1, 19, 3, 1, p.b)
  fill(g, tx + tw - 4, 19, 3, 1, p.b)
}

/* ---------- faces people remember ---------- */

function hairGingerMess(g: Grid, p: Palette) {
  fill(g, 5, 0, 10, 1, p.h)
  put(g, 4, 0, p.h)
  put(g, 11, 0, p.H)
  put(g, 14, 0, p.h)
  fill(g, 3, 1, 14, 1, p.h)
  fill(g, 3, 2, 2, 3, p.h)
  fill(g, 15, 2, 2, 3, p.h)
  // messy swept fringe
  fill(g, 5, 2, 4, 1, p.h)
  fill(g, 10, 2, 5, 1, p.h)
  put(g, 9, 1, p.H)
  put(g, 6, 3, p.h)
  put(g, 13, 3, p.h)
  put(g, 14, 3, p.h)
  put(g, 4, 4, p.h)
  put(g, 15, 4, p.h)
  put(g, 4, 5, p.h)
  put(g, 15, 5, p.h)
}

function hairSpiky(g: Grid, p: Palette) {
  // big crown of spikes
  fill(g, 5, 0, 10, 1, p.h)
  put(g, 4, 0, p.h)
  put(g, 6, 0, p.h)
  put(g, 10, 0, p.H)
  put(g, 13, 0, p.h)
  put(g, 15, 0, p.h)
  fill(g, 3, 1, 14, 1, p.h)
  fill(g, 3, 2, 2, 3, p.h)
  fill(g, 15, 2, 2, 3, p.h)
  fill(g, 5, 2, 10, 1, p.h)
  put(g, 6, 3, p.h)
  put(g, 9, 2, p.H)
  put(g, 12, 3, p.h)
  put(g, 4, 4, p.h)
  put(g, 15, 4, p.h)
  put(g, 4, 5, p.h)
  put(g, 15, 5, p.h)
}

function hairCowboy(g: Grid, p: RPalette) {
  // wide brim, then the crown
  fill(g, 1, 3, 18, 1, p.o)
  fill(g, 1, 2, 18, 1, p.hat)
  fill(g, 0, 3, 1, 1, p.hat)
  fill(g, 19, 3, 1, 1, p.hat)
  fill(g, 4, 0, 12, 1, p.o)
  fill(g, 5, 1, 10, 1, p.hat)
  fill(g, 4, 2, 12, 1, p.hat)
  fill(g, 4, 2, 12, 1, p.d)
  fill(g, 4, 3, 12, 1, p.hat)
  put(g, 5, 1, p.H)
  put(g, 6, 2, p.a)
  // white sideburns
  fill(g, 4, 4, 1, 4, p.w)
  fill(g, 15, 4, 1, 4, p.w)
}

function hairAfro(g: Grid, p: Palette) {
  fill(g, 4, 0, 12, 1, p.o)
  fill(g, 3, 1, 14, 1, p.h)
  fill(g, 2, 2, 16, 1, p.h)
  fill(g, 2, 3, 2, 4, p.h)
  fill(g, 16, 3, 2, 4, p.h)
  fill(g, 3, 4, 2, 3, p.h)
  fill(g, 15, 4, 2, 3, p.h)
  put(g, 5, 1, p.H)
  put(g, 13, 1, p.H)
  put(g, 4, 2, p.H)
}

function hairCurlsRed(g: Grid, p: Palette) {
  fill(g, 4, 0, 12, 1, p.o)
  fill(g, 2, 1, 16, 1, p.h)
  fill(g, 1, 2, 18, 1, p.h)
  fill(g, 1, 3, 2, 4, p.h)
  fill(g, 17, 3, 2, 4, p.h)
  fill(g, 2, 4, 2, 3, p.h)
  fill(g, 16, 4, 2, 3, p.h)
  put(g, 3, 2, p.H)
  put(g, 8, 1, p.H)
  put(g, 14, 2, p.H)
  put(g, 2, 6, p.H)
  put(g, 17, 6, p.H)
}

function hairBobBlack(g: Grid, p: Palette) {
  fill(g, 4, 0, 12, 1, p.o)
  fill(g, 4, 1, 12, 2, p.h)
  fill(g, 3, 2, 2, 6, p.h)
  fill(g, 15, 2, 2, 6, p.h)
  fill(g, 4, 3, 1, 5, p.h)
  fill(g, 15, 3, 1, 5, p.h)
  put(g, 8, 1, p.H)
  put(g, 11, 1, p.H)
  put(g, 3, 8, p.o)
  put(g, 16, 8, p.o)
}

function hairBobBand(g: Grid, p: Palette) {
  fill(g, 4, 0, 12, 1, p.o)
  fill(g, 4, 1, 12, 1, p.c)
  fill(g, 4, 2, 12, 2, p.h)
  fill(g, 3, 2, 2, 6, p.h)
  fill(g, 15, 2, 2, 6, p.h)
  fill(g, 4, 3, 1, 5, p.h)
  fill(g, 15, 3, 1, 5, p.h)
  put(g, 8, 2, p.C)
  put(g, 11, 2, p.C)
  put(g, 3, 8, p.o)
  put(g, 16, 8, p.o)
}

function hairPigtails(g: Grid, p: Palette) {
  fill(g, 4, 0, 12, 1, p.o)
  fill(g, 4, 1, 12, 2, p.h)
  fill(g, 3, 2, 2, 6, p.h)
  fill(g, 15, 2, 2, 6, p.h)
  fill(g, 5, 3, 10, 1, p.h)
  put(g, 7, 1, p.H)
  put(g, 12, 1, p.H)
  // two chunky pigtails, tied with purple bands
  fill(g, 1, 4, 3, 1, p.o)
  fill(g, 0, 5, 3, 3, p.h)
  fill(g, 1, 8, 2, 1, p.o)
  fill(g, 2, 5, 1, 2, p.a)
  fill(g, 16, 4, 3, 1, p.o)
  fill(g, 17, 5, 3, 3, p.h)
  fill(g, 17, 5, 1, 2, p.a)
  fill(g, 17, 8, 2, 1, p.o)
  put(g, 3, 9, p.o)
  put(g, 16, 9, p.o)
}

function hairFlatTop(g: Grid, p: Palette) {
  fill(g, 4, 0, 12, 1, p.o)
  fill(g, 5, 1, 10, 1, p.h)
  fill(g, 4, 2, 12, 2, p.h)
  fill(g, 4, 1, 1, 2, p.h)
  fill(g, 15, 1, 1, 2, p.h)
  put(g, 6, 1, p.H)
  put(g, 9, 1, p.H)
  put(g, 12, 1, p.H)
  // shaved fade at the temples
  put(g, 3, 3, p.H)
  put(g, 16, 3, p.H)
  put(g, 3, 4, p.h)
  put(g, 16, 4, p.h)
}

function hairSpikyDark(g: Grid, p: Palette) {
  fill(g, 4, 0, 7, 1, p.h)
  fill(g, 11, 0, 5, 1, p.h)
  put(g, 9, 0, p.H)
  fill(g, 3, 1, 14, 1, p.h)
  fill(g, 2, 2, 16, 1, p.h)
  fill(g, 2, 3, 2, 4, p.h)
  fill(g, 16, 3, 2, 4, p.h)
  fill(g, 5, 2, 4, 1, p.h)
  fill(g, 11, 2, 4, 1, p.h)
  put(g, 4, 2, p.H)
  put(g, 14, 2, p.H)
  put(g, 7, 3, p.h)
  put(g, 12, 3, p.h)
  put(g, 3, 4, p.h)
  put(g, 16, 4, p.h)
  put(g, 3, 5, p.h)
  put(g, 16, 5, p.h)
}

function hairSidePart(g: Grid, p: Palette) {
  fill(g, 4, 0, 12, 1, p.o)
  fill(g, 4, 1, 12, 2, p.h)
  fill(g, 3, 2, 2, 3, p.h)
  fill(g, 15, 2, 2, 3, p.h)
  fill(g, 4, 3, 5, 1, p.h)
  fill(g, 10, 3, 5, 2, p.h)
  put(g, 9, 1, p.H)
  put(g, 9, 2, p.o)
  put(g, 13, 2, p.H)
  put(g, 3, 4, p.h)
  put(g, 16, 4, p.h)
}

function hairHornedHelmet(g: Grid, p: RPalette) {
  // brown hair under the rim
  fill(g, 4, 3, 12, 2, p.h)
  put(g, 3, 4, p.h)
  put(g, 16, 4, p.h)
  put(g, 4, 5, p.h)
  put(g, 15, 5, p.h)
  // left horn
  fill(g, 0, 1, 3, 1, p.o)
  fill(g, 0, 0, 2, 1, p.o)
  put(g, 1, 1, p.w)
  put(g, 2, 1, p.w)
  put(g, 1, 2, p.hat)
  put(g, 2, 2, p.hat)
  put(g, 0, 2, p.o)
  // right horn
  fill(g, 17, 1, 3, 1, p.o)
  fill(g, 18, 0, 2, 1, p.o)
  put(g, 17, 1, p.w)
  put(g, 18, 1, p.w)
  put(g, 17, 2, p.hat)
  put(g, 18, 2, p.hat)
  put(g, 19, 2, p.o)
  // metal dome
  fill(g, 4, 0, 12, 1, p.o)
  fill(g, 5, 1, 10, 1, p.hat)
  fill(g, 4, 2, 12, 1, p.hat)
  fill(g, 4, 3, 12, 1, p.d)
  fill(g, 6, 1, 3, 1, p.H)
  put(g, 5, 2, p.w)
  put(g, 14, 2, p.w)
  put(g, 6, 3, p.a)
  put(g, 10, 3, p.a)
  put(g, 14, 3, p.a)
}

function hairCap(g: Grid, p: RPalette, crown: string, brim: string) {
  fill(g, 5, 0, 10, 1, p.o)
  fill(g, 5, 1, 10, 1, crown)
  fill(g, 4, 2, 12, 1, crown)
  fill(g, 4, 3, 12, 1, brim)
  fill(g, 3, 3, 1, 1, brim)
  fill(g, 16, 3, 1, 1, brim)
  put(g, 8, 1, p.w)
  put(g, 11, 1, p.w)
  put(g, 6, 1, p.H)
}

function hairChecker(g: Grid, p: Palette) {
  fill(g, 4, 0, 12, 1, p.h)
  fill(g, 3, 1, 14, 2, p.h)
  fill(g, 3, 3, 2, 3, p.h)
  fill(g, 15, 3, 2, 3, p.h)
  for (let y = 0; y < 3; y++) {
    for (let x = 3; x < 17; x++) {
      if ((x + y) % 2 === 0) put(g, x, y + 1, p.w)
    }
  }
  put(g, 4, 4, p.w)
  put(g, 15, 4, p.w)
}

function hairJock(g: Grid, p: Palette) {
  fill(g, 5, 0, 10, 1, p.h)
  fill(g, 4, 1, 12, 1, p.h)
  fill(g, 4, 2, 2, 2, p.h)
  fill(g, 14, 2, 2, 2, p.h)
  fill(g, 5, 2, 10, 1, p.h)
  put(g, 8, 1, p.H)
  put(g, 4, 3, p.h)
  put(g, 15, 3, p.h)
}

function hairHood(g: Grid, p: Palette) {
  fill(g, 3, 0, 14, 1, p.c)
  fill(g, 2, 1, 16, 1, p.c)
  fill(g, 1, 2, 2, 8, p.c)
  fill(g, 17, 2, 2, 8, p.c)
  fill(g, 3, 9, 2, 2, p.c)
  fill(g, 15, 9, 2, 2, p.c)
  fill(g, 3, 0, 14, 1, p.o)
  fill(g, 1, 2, 1, 8, p.o)
  fill(g, 18, 2, 1, 8, p.o)
  put(g, 2, 1, p.o)
  put(g, 17, 1, p.o)
  fill(g, 6, 3, 3, 1, p.h)
  fill(g, 11, 3, 3, 1, p.h)
}

function hairLong(g: Grid, p: Palette) {
  fill(g, 4, 0, 12, 1, p.o)
  fill(g, 4, 1, 12, 1, p.h)
  fill(g, 3, 2, 2, 8, p.h)
  fill(g, 15, 2, 2, 8, p.h)
  fill(g, 2, 4, 1, 6, p.h)
  fill(g, 17, 4, 1, 6, p.h)
  fill(g, 5, 2, 10, 1, p.h)
  put(g, 10, 2, p.H)
  put(g, 3, 9, p.o)
  put(g, 16, 9, p.o)
}

function drawRobot(g: Grid, p: Palette) {
  put(g, 9, 0, p.led)
  put(g, 10, 0, p.led)
  put(g, 9, 1, p.o)
  put(g, 10, 1, p.o)
  fill(g, 4, 2, 12, 9, p.o)
  fill(g, 5, 3, 10, 7, p.w)
  fill(g, 5, 3, 10, 1, p.a)
  put(g, 3, 5, p.o)
  put(g, 16, 5, p.o)
  fill(g, 6, 5, 8, 4, p.o)
  fill(g, 7, 6, 6, 2, p.screen)
  put(g, 8, 6, p.led)
  put(g, 11, 6, p.led)
  fill(g, 7, 9, 6, 1, p.d)
}

function drawAccessory(g: Grid, kind: Accessory, p: RPalette) {
  if (kind === 'glasses') {
    fill(g, 6, 5, 4, 1, p.o)
    fill(g, 11, 5, 4, 1, p.o)
    fill(g, 6, 7, 4, 1, p.o)
    fill(g, 11, 7, 4, 1, p.o)
    put(g, 5, 6, p.o)
    put(g, 10, 6, p.o)
    put(g, 14, 6, p.o)
  } else if (kind === 'goggles') {
    fill(g, 5, 5, 5, 2, p.w)
    fill(g, 11, 5, 5, 2, p.w)
    fill(g, 5, 5, 5, 1, p.o)
    fill(g, 11, 5, 5, 1, p.o)
    put(g, 10, 6, p.o)
  } else if (kind === 'headphones') {
    fill(g, 3, 1, 14, 1, p.o)
    fill(g, 2, 2, 1, 2, p.o)
    fill(g, 17, 2, 1, 2, p.o)
    fill(g, 2, 4, 2, 3, p.a)
    fill(g, 16, 4, 2, 3, p.a)
  } else if (kind === 'safety') {
    fill(g, 5, 5, 5, 1, p.a)
    fill(g, 10, 5, 5, 1, p.a)
    put(g, 9, 5, p.o)
  } else if (kind === 'earring') {
    put(g, 3, 7, p.a)
  } else if (kind === 'stubble') {
    fill(g, 5, 9, 10, 1, p.h)
    put(g, 5, 8, p.h)
    put(g, 14, 8, p.h)
  } else if (kind === 'beard') {
    fill(g, 5, 8, 10, 2, p.beard)
    fill(g, 4, 7, 1, 3, p.beard)
    fill(g, 15, 7, 1, 3, p.beard)
    fill(g, 6, 7, 8, 1, p.beard)
    put(g, 7, 9, p.o)
    put(g, 12, 9, p.o)
  } else if (kind === 'mustache') {
    fill(g, 7, 7, 6, 1, p.h)
    put(g, 6, 7, p.h)
    put(g, 13, 7, p.h)
  } else if (kind === 'handlebar') {
    fill(g, 6, 7, 8, 1, p.w)
    put(g, 5, 7, p.w)
    put(g, 14, 7, p.w)
    put(g, 4, 8, p.w)
    put(g, 15, 8, p.w)
    put(g, 7, 8, p.H)
    put(g, 12, 8, p.H)
  } else if (kind === 'goatee') {
    fill(g, 8, 9, 4, 1, p.h)
    put(g, 8, 8, p.h)
    put(g, 11, 8, p.h)
  }
}

/* ---------- assembly ---------- */

const HAIR: Record<HairStyle, (g: Grid, p: RPalette) => void> = {
  bob: hairBobBlack,
  beanie: hairSpiky,
  hood: hairHood,
  bun: hairBobBlack,
  cap: (g, p) => hairCap(g, p, p.a, p.d),
  robot: drawRobot,
  curls: hairCurlsRed,
  long: hairLong,
  'messy, wild': hairSpiky,
  spikyOrange: hairSpiky,
  spikyMaroon: hairSpiky,
  cowboy: hairCowboy,
  afro: hairAfro,
  curlsRed: hairCurlsRed,
  bobBlack: hairBobBlack,
  capGrey: (g, p) => hairCap(g, p, p.h, p.d),
  capRed: (g, p) => hairCap(g, p, p.a, p.c),
  jock: hairJock,
  checker: hairChecker,
  gingerMess: hairGingerMess,
  hornedHelmet: hairHornedHelmet,
  pigtails: hairPigtails,
  bobBand: hairBobBand,
  flatTop: hairFlatTop,
  spikyDark: hairSpikyDark,
  sidePart: hairSidePart,
}

function buildGrid(member: CrewMember, mouthOpen: boolean): Grid {
  const g = blank()
  const p = resolve(member.palette)

  if (member.hair === 'robot') {
    drawRobot(g, p)
    drawBody(g, p, member)
    return g
  }

  drawBody(g, p, member)
  drawHead(g, p)
  HAIR[member.hair](g, p)
  drawAccessory(g, member.accessory, p)
  drawMouth(g, p, mouthOpen)
  if (member.cigar) {
    fill(g, 11, 8, 5, 1, '#6b3f1c')
    put(g, 15, 8, '#e23b2e')
    put(g, 16, 8, '#f2a03d')
    put(g, 16, 7, '#b0b0b0')
    put(g, 17, 6, '#8a8a8a')
  }
  return g
}

export interface SpriteData {
  runs: { x: number; y: number; w: number; color: string }[]
}

function toRuns(grid: Grid): SpriteData {
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
      runs.push({ x, y, w, color: key })
      x += w
    }
  }
  return { runs }
}

export function spriteAscii(id: CrewId): string[] {
  return buildGrid(CREW_BY_ID[id], false).map((row) => row.join(''))
}

export const SPRITES: Record<CrewId, SpriteData> = Object.keys(CREW_BY_ID).reduce(
  (acc, id) => {
    const member = CREW_BY_ID[id as CrewId]
    acc[id as CrewId] = toRuns(buildGrid(member, false))
    return acc
  },
  {} as Record<CrewId, SpriteData>,
)

export const SPRITES_TALK: Record<CrewId, SpriteData> = Object.keys(CREW_BY_ID).reduce(
  (acc, id) => {
    const member = CREW_BY_ID[id as CrewId]
    acc[id as CrewId] = toRuns(buildGrid(member, true))
    return acc
  },
  {} as Record<CrewId, SpriteData>,
)
