import {keydownHandler} from "prosemirror-keymap"
import {TextSelection, Plugin} from "prosemirror-state"
import {Decoration, DecorationSet} from "prosemirror-view"

import {BlockCursor} from "./block-cursor"

export const blockCursor = function() {
  return new Plugin({
    props: {
      decorations: drawBlockCursor,

      createSelectionBetween(_view, $anchor, $head) {
        if ($anchor.pos == $head.pos && BlockCursor.valid($head)) return new BlockCursor($head)
      },

      handleClick,
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

function handleClick(view, pos) {
  let $pos = view.state.doc.resolve(pos)
  if (!BlockCursor.valid($pos)) return false
  view.dispatch(view.state.tr.setSelection(new BlockCursor($pos)))
  return true
}

function drawBlockCursor(state) {
  if (!(state.selection instanceof BlockCursor)) return null
  let node = document.createElement("div")
  node.className = "ProseMirror-block-cursor"
  return DecorationSet.create(state.doc, [Decoration.widget(state.selection.head, node, {key: "block-cursor"})])
}
