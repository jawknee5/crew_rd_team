import type { CrewId } from '../data/crew'
import { SPRITES, SPRITES_TALK } from '../pixels/sprites'

export function SpriteRuns({ crew, talk }: { crew: CrewId; talk?: boolean }) {
  const sprite = talk ? SPRITES_TALK[crew] : SPRITES[crew]
  return (
    <>
      {sprite.runs.map((run, index) => (
        <rect key={index} x={run.x} y={run.y} width={run.w} height={1} fill={run.color} />
      ))}
    </>
  )
}

export function BustSprite({ crew }: { crew: CrewId }) {
  return (
    <svg
      viewBox="3 1 14 12"
      preserveAspectRatio="xMidYMin meet"
      shapeRendering="crispEdges"
      className="bust-sprite"
      aria-hidden="true"
    >
      <SpriteRuns crew={crew} />
    </svg>
  )
}

export function PixelSprite({
  crew,
  size = 48,
  className,
  talk,
}: {
  crew: CrewId
  size?: number
  className?: string
  talk?: boolean
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      <SpriteRuns crew={crew} talk={talk} />
    </svg>
  )
}
