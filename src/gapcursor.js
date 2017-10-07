import {Selection} from "prosemirror-state"
import {Slice, Fragment} from "prosemirror-model"
import {replaceStep} from "prosemirror-transform"

// ::- Gap cursor selections are represented using this class. Its
// `$anchor` and `$head` properties both point at the cursor position.
export class GapCursor extends Selection {
  // : (ResolvedPos)
  constructor($pos) {
    super($pos, $pos)
  }

  map(doc, mapping) {
    let $pos = doc.resolve(mapping.map(this.head))
    return GapCursor.valid($pos) ? new GapCursor($pos) : Selection.near($pos)
  }

  content() { return Slice.empty }

  replace(tr, content = Slice.empty) {
    if (content.size == 0) return
    let $pos = this.$head, before = $pos.nodeBefore, after = $pos.nodeAfter
    // Searches for a position where the content can be inserted.
    // Tries precise position first, then positions before it (by
    // entering nodes starting directly before), then positions after.
    let textBlockWrapper = content.content.content.every(node => node.isInline) ?
      Object.values($pos.doc.type.schema.nodes).find(node => node.spec.defaultTextBlock) :
      false

    for (let dir = -1, pos = $pos.pos;;) {
      let slice = !$pos.parent.isTextblock && textBlockWrapper ?
        new Slice(Fragment.from(textBlockWrapper.create(null, content.content.content)), 0, 0) :
        content
      let step = replaceStep(tr.doc, pos, pos, slice)
      if (step && step.slice.size) {
        tr.step(step)
        break
      }
      if (dir < 0) {
        if (!before || before.type.spec.isolating) {
          dir = 1
          pos = $pos.pos
        } else {
          before = before.lastChild
          pos--
        }
      }
      if (dir > 0) {
        if (!after || after.type.spec.isolating) break
        after = after.firstChild
        pos++
      }
    }
  }

  replaceWith(tr, node) {
    this.replace(tr, new Slice(Fragment.from(node), 0, 0))
  }

  eq(other) {
    return other instanceof GapCursor && other.head == this.head
  }

  toJSON() {
    return {type: "gapcursor", pos: this.head}
  }

  static fromJSON(doc, json) {
    return new GapCursor(doc.resolve(json.pos))
  }

  getBookmark() { return new GapBookmark(this.anchor) }

  static valid($pos, topDepth) {
    if ($pos.parent.inlineContent || $pos.parent.type.spec.allowGapCursor === false) return false
    let index = $pos.index()
    return (index == 0 ? $pos.depth == topDepth : closedAt($pos.parent.child(index - 1), 1)) &&
      (index == $pos.parent.childCount ? $pos.depth == topDepth : closedAt($pos.parent.child(index), -1))
  }

  static findFrom($pos, dir, mustMove) {
    let topDepth = $pos.depth
    for (let e = $pos.depth; e > -1; e--) {
      if ($pos.node(e).type.spec.allowGapCursor !== false) topDepth = e
    }
    for (let d = $pos.depth;; d--) {
      let parent = $pos.node(d)
      if (d == topDepth || (dir > 0 ? $pos.indexAfter(d) < parent.childCount : $pos.index(d) > 0)) {
        if (mustMove && d == $pos.depth) return null
        let $here = $pos.doc.resolve(dir < 0 ? $pos.before(d + 1) : $pos.after(d + 1))
        return GapCursor.valid($here, topDepth) ? $here : null
      }
    }
  }
}

GapCursor.prototype.visible = false

Selection.jsonID("gapcursor", GapCursor)

class GapBookmark {
  constructor(pos) {
    this.pos = pos
  }
  map(mapping) {
    return new GapBookmark(mapping.map(this.pos))
  }
  resolve(doc) {
    let $pos = doc.resolve(this.pos)
    return GapCursor.valid($pos) ? new GapCursor($pos) : Selection.near($pos)
  }
}

function closedAt(node, side) {
  for (;;) {
    if (node.inlineContent) return false
    if (node.childCount == 0 || node.type.spec.isolating) return true
    node = side < 0 ? node.firstChild : node.lastChild
  }
}
