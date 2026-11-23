import { createRoot } from 'react-dom/client'
import { CREW } from './data/crew'
import { SPRITES } from './pixels/sprites'
import { drawCrewSprite, type PreviewSprite } from './pixels/pixelStyles'
import './preview.css'

function Runs({ sprite }: { sprite: PreviewSprite }) {
  return (
    <>
      {sprite.runs.map((run, index) => (
        <rect key={index} x={run.x} y={run.y} width={run.w} height={1} fill={run.color} />
      ))}
    </>
  )
}

function Figure({ sprite, height, label }: { sprite: PreviewSprite; height: number; label: string }) {
  const width = Math.round((height * sprite.w) / sprite.h)
  return (
    <figure className="figure">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${sprite.w} ${sprite.h}`}
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <Runs sprite={sprite} />
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  )
}

function App() {
  return (
    <main className="sheet">
      <header className="sheet-head">
        <span className="eyebrow">CREW R&amp;D · VISUAL STUDY</span>
        <h1>Three ways to draw the crew</h1>
        <p>
          Same 13 characters, same palettes and outfits. The current 20×20 chibi is on the left; the
          middle is a corrected 8-bit full-body sprite; the right is a shaded 16-bit take.
        </p>
        <div className="legend">
          <span><b>20×20</b> current</span>
          <span><b>28×40</b> updated 8-bit</span>
          <span><b>44×60</b> 16-bit</span>
        </div>
      </header>

      <section className="grid">
        {CREW.map((member) => (
          <article className="card" key={member.id} style={{ ['--accent' as string]: member.accent }}>
            <div className="card-head">
              <h2>{member.name}</h2>
              <span>{member.agent}</span>
            </div>
            <div className="figures">
              <Figure sprite={{ w: 20, h: 20, runs: SPRITES[member.id].runs }} height={100} label="CURRENT" />
              <Figure sprite={drawCrewSprite(member, '8bit')} height={120} label="8-BIT" />
              <Figure sprite={drawCrewSprite(member, '16bit')} height={180} label="16-BIT" />
            </div>
            <div className="card-foot">
              <span>{member.build ?? 'normal'} build</span>
              <span>{member.outfit}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
