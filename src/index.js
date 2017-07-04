const {Plugin} = require("prosemirror-state")
const {keydownHandler} = require("prosemirror-keymap")
const {TextSelection} = require("prosemirror-state")

const {BlockCursor} = require("./block-cursor")

exports.blockCursor = function() {
  return new Plugin({
    props: {
      decorations: BlockCursor.draw,

      createSelectionBetween(_view, $anchor, $head) {
        if ($anchor.pos == $head.pos && BlockCursor.valid($head)) return new BlockCursor($head)
      },

      handleKeyDown
    }
  })
}

const handleKeyDown = keydownHandler({
  "ArrowLeft": arrow("horiz", -1),
  "ArrowRight": arrow("horiz", 1),
  "ArrowUp": arrow("vert", -1),
  "ArrowDown": arrow("vert", 1)
})

function arrow(axis, dir) {
  let dirStr = axis == "vert" ? (dir > 0 ? "down" : "up") : (dir > 0 ? "right" : "left")
  return function(state, dispatch, view) {
    let sel = state.selection
    let $start = dir > 0 ? sel.$to : sel.$from, mustMove = sel.empty
    if (sel instanceof TextSelection) {
      if (!view.endOfTextblock(dirStr)) return false
      mustMove = false
      $start = state.doc.resolve(dir > 0 ? $start.after() : $start.before())
    }
    let $found = BlockCursor.findFrom($start, dir, mustMove)
    if (!$found) return false
    if (dispatch) dispatch(state.tr.setSelection(new BlockCursor($found)))
    return true
  }
}
