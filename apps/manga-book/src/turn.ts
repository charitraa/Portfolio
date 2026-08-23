/**
 * Live turn state, deliberately outside React.
 *
 * A drag updates this on every pointermove and the sheets read it inside
 * useFrame. Routing sixty updates a second through the store would re-render
 * the entire overlay for something only the renderer cares about.
 */
export const turn = {
  /** sheet index under the reader's finger, -1 when nothing is held */
  active: -1,
  /** 0 → 1, how far through the turn the drag has got */
  progress: 0,
  /** where the held sheet should sit: 0 = lying right, 1 = lying left */
  t: 0,
  /** 1 = turning forward (right to left), -1 = turning back */
  dir: 1 as 1 | -1,
  /** progress per second — used to let a flick carry the page over */
  velocity: 0,
  /** sheet whose near corner is under the cursor, -1 for none */
  peeled: -1,
  /**
   * The drag is over and the sheet is coasting to the side it was thrown at.
   * It stays `active` throughout, because letting go of it the instant the
   * finger lifts would hand it back to a store that has not re-rendered yet —
   * the sheet would drop back onto the stack for those frames and only then
   * turn over.
   */
  settling: false,
};

export const release = () => {
  turn.active = -1;
  turn.progress = 0;
  turn.velocity = 0;
  turn.settling = false;
};

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
