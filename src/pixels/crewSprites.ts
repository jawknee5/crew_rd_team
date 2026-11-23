import { CREW_BY_ID, type CrewId } from '../data/crew'
import { drawCrewSprite } from './pixelStyles'
import { SPRITES, SPRITES_TALK, type SpriteData } from './sprites'

/** Benny keeps the original 20x20 chibi grid: he is the smallest guy in the room. */
const CHIBI_SPRITE: CrewId = 'chip'

export interface SpriteBox {
  x: number
  y: number
  w: number
  h: number
}

export interface CrewSprite {
  w: number
  h: number
  runs: SpriteData['runs']
  /** Head-and-shoulders crop used by the bust portrait. */
  bust: SpriteBox
}

/** The chibi's face, cropped exactly as the old bust did. */
const CHIBI_BUST: SpriteBox = { x: 3, y: 1, w: 14, h: 12 }

/** The 16-bit grid is 44x60: the head spans x 13-31 and the hair starts at y 0. */
const DETAIL_BUST: SpriteBox = { x: 6, y: 0, w: 33, h: 26 }

export function crewSprite(id: CrewId, talk = false): CrewSprite {
  if (id === CHIBI_SPRITE) {
    const sprite = talk ? SPRITES_TALK[id] : SPRITES[id]
    return { w: 20, h: 20, runs: sprite.runs, bust: CHIBI_BUST }
  }
  return { ...drawCrewSprite(CREW_BY_ID[id], '16bit', talk), bust: DETAIL_BUST }
}
