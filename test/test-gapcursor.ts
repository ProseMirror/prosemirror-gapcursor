import ist from "ist"
import {Schema} from "prosemirror-model"
import {GapCursor} from "prosemirror-gapcursor"

const schema = new Schema({
  nodes: {
    doc: {content: "block+"},
    text: {group: "inline"},
    paragraph: {group: "block", content: "inline*"},
    section: {group: "block", content: "block+"},
    maybe_section: {group: "block", content: "block*"},
    atom_block: {group: "block", atom: true, selectable: true}
  },
  marks: {}
})

function docWith(...content: any[]) {
  return schema.node("doc", null, content)
}

describe("GapCursor.valid", () => {
  it("allows a gap cursor at the start and end of a document when adjacent to an atom block", () => {
    let doc = docWith(schema.node("atom_block"))

    ist(GapCursor.valid(doc.resolve(0)))
    ist(GapCursor.valid(doc.resolve(doc.content.size)))
  })

  it("disallows a gap cursor at the start and end of a document when adjacent to a textblock", () => {
    let doc = docWith(schema.node("paragraph", null, schema.text("hi")))

    ist(GapCursor.valid(doc.resolve(0)), false)
    ist(GapCursor.valid(doc.resolve(doc.content.size)), false)
  })

  it("allows a gap cursor at the start and end of a block when adjacent to an atom block", () => {
    let section = schema.node("section", null, [schema.node("atom_block")])
    let doc = docWith(section)

    let sectionStart = doc.resolve(1)
    let sectionEnd = doc.resolve(1 + section.content.size)

    ist(sectionStart.parent.type.name, "section")
    ist(sectionEnd.parent.type.name, "section")
    ist(GapCursor.valid(sectionStart))
    ist(GapCursor.valid(sectionEnd))
  })

  it("allows a gap cursor in an empty block", () => {
    let section = schema.node("maybe_section")
    let doc = docWith(section)

    let maybeSectionStart = doc.resolve(1)
    let maybeSectionEnd = doc.resolve(1 + section.content.size)

    ist(maybeSectionStart.parent.type.name, "maybe_section")
    ist(maybeSectionEnd.parent.type.name, "maybe_section")
    ist(GapCursor.valid(maybeSectionStart))
    ist(GapCursor.valid(maybeSectionEnd))
  })
})
