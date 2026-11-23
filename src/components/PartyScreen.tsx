import type { CrewId } from '../data/crew'
import { CREW } from '../data/crew'
import { DEFAULT_TOOL_IDS, TOOLS, resolveTools } from '../data/tools'
import type { CrewLoadout } from '../loadouts'
import { PixelSprite } from './PixelSprite'

interface PartyScreenProps {
  loadout: CrewLoadout
  sessionTitle: string
  hasMeeting: boolean
  papersReady: number
  papersTotal: number
  onOpenCrew: (crew: CrewId) => void
  onBoardroom: () => void
  onBrief: () => void
}

/**
 * The RPG party menu: the main window of the app. Thirteen large member cards,
 * each a door into that character's own room and ability board.
 */
export function PartyScreen({
  loadout,
  sessionTitle,
  hasMeeting,
  papersReady,
  papersTotal,
  onOpenCrew,
  onBoardroom,
  onBrief,
}: PartyScreenProps) {
  return (
    <section className="party-screen" aria-label="Crew roster">
      <div className="party-head">
        <div>
          <span className="party-kicker">PARTY MENU · CREW R&amp;D</span>
          <h2>CREW ROSTER</h2>
          <p className="party-sub">
            Thirteen specialists on the board. Pick a member to open their room, inspect their abilities and set the
            tools they carry into this session.
          </p>
        </div>
        <div className="party-head-side">
          <span className="party-ready">
            <i /> 13 / 13 READY
          </span>
          <span className="party-session">
            {hasMeeting ? `RUN · ${sessionTitle}` : 'NO ACTIVE RUN · STANDBY LOADOUT'}
          </span>
          <span className="party-session-dim">
            {hasMeeting ? `${papersReady}/${papersTotal} PAPERS ON THE TABLE` : 'BRIEF THE CREW TO START A RUN'}
          </span>
        </div>
      </div>

      <div className="party-grid">
        {CREW.map((member, index) => {
          const active = resolveTools(member.id, loadout[member.id])
          const total = TOOLS[member.id].length
          const custom = active.length !== DEFAULT_TOOL_IDS[member.id].length
          return (
            <button
              type="button"
              key={member.id}
              className="party-card"
              style={{ ['--accent' as string]: member.accent }}
              onClick={() => onOpenCrew(member.id)}
              aria-label={`Enter ${member.name}'s room`}
            >
              <span className="party-index">No.{String(index + 1).padStart(2, '0')}</span>
              <span className="party-portrait">
                <i className="party-portrait-glow" aria-hidden="true" />
                <PixelSprite crew={member.id} size={member.id === 'chip' ? 76 : 92} />
              </span>
              <span className="party-body">
                <span className="party-name">{member.name}</span>
                <span className="party-class">{member.agent}</span>
                <span className="party-role">{member.role}</span>
                <span className="party-tags">
                  <i className="party-tag party-tag-tools">
                    TOOLS {active.length}/{total}
                    {custom ? ' *' : ''}
                  </i>
                  <i className="party-tag">{member.persona}</i>
                </span>
              </span>
              <span className="party-enter">ENTER ▸</span>
            </button>
          )
        })}
      </div>

      <div className="party-foot">
        <span className="party-foot-note">
          SELECT A CARD → FADE TO THAT MEMBER'S ROOM · ESC RETURNS TO THE PARTY
        </span>
        <div className="party-foot-actions">
          <button type="button" className="btn btn-ghost" onClick={onBoardroom}>
            BOARDROOM ▸
          </button>
          <button type="button" className="btn btn-primary" onClick={onBrief}>
            {hasMeeting ? 'NEW BRIEF' : 'BRIEF THE CREW'}
          </button>
        </div>
      </div>
    </section>
  )
}
