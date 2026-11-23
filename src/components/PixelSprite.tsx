import type { CrewId } from '../data/crew'
import { crewSprite } from '../pixels/crewSprites'

export function SpriteRuns({ crew, talk }: { crew: CrewId; talk?: boolean }) {
  const sprite = crewSprite(crew, talk)
  return (
    <>
      {sprite.runs.map((run, index) => (
        <rect key={index} x={run.x} y={run.y} width={run.w} height={1} fill={run.color} />
      ))}
    </>
  )
}

export function BustSprite({ crew }: { crew: CrewId }) {
  const { bust } = crewSprite(crew)
  return (
    <svg
      viewBox={`${bust.x} ${bust.y} ${bust.w} ${bust.h}`}
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
  const sprite = crewSprite(crew, talk)
  const width = Math.round((size * sprite.w) / sprite.h)
  return (
    <svg
      viewBox={`0 0 ${sprite.w} ${sprite.h}`}
      width={width}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      <SpriteRuns crew={crew} talk={talk} />
    </svg>
  )
}
