interface WhiteboardProps {
  topic: string | null
  modeLabel: string | null
  phase: string
  papersIn: number
  papersTotal: number
  progress: number
  onClick: () => void
}

export function Whiteboard({
  topic,
  modeLabel,
  phase,
  papersIn,
  papersTotal,
  progress,
  onClick,
}: WhiteboardProps) {
  return (
    <button
      type="button"
      className={`board ${topic ? 'board-active' : 'board-idle'}`}
      onClick={onClick}
      title="Click to brief the crew"
      aria-label="Whiteboard: click to brief the crew"
    >
      <span className="board-surface">
        <span className="board-pin" aria-hidden="true" />
        <span className="board-head">
          <span>MEETING BRIEF</span>
          <span className="board-edit">CLICK TO EDIT</span>
        </span>
        <span className="board-body">
          {topic ?? 'Blank board. Click it and tell the crew what to research, build, or break.'}
        </span>
        <span className="board-meta">
          <span className="board-mode">{modeLabel ?? 'AWAITING BRIEF'}</span>
          <span className="board-count">{topic ? `${papersIn}/${papersTotal} PAPERS` : 'NO RUN'}</span>
        </span>
        <span className="board-progress" aria-hidden="true">
          <i style={{ width: `${Math.round(progress * 100)}%` }} />
        </span>
        <span className="board-status">{phase}</span>
      </span>
      <span className="board-tray" aria-hidden="true">
        <i className="marker marker-red" />
        <i className="marker marker-blue" />
        <i className="marker marker-black" />
        <i className="eraser" />
      </span>
    </button>
  )
}
