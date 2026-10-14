/** What the judge badges on images and text rows mean. */
export function JudgeLegend() {
  return (
    <div className="judge-legend" aria-label="Judge labels">
      <span className="jl-title">Judge</span>
      <span><b className="jbadge inline D">D</b> moved toward the steered pole</span>
      <span><b className="jbadge inline N">N</b> moved away from it (steering failure, not a judge error)</span>
      <span><b className="jbadge inline T">T</b> no clear change</span>
    </div>
  )
}
