import {describe, expect, it} from "vitest"
import {Schema} from "prosemirror-model"
import {GapCursor} from "../src/gapcursor"

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
    const doc = docWith(schema.node("atom_block"))

    expect(GapCursor.valid(doc.resolve(0))).toBe(true)
    expect(GapCursor.valid(doc.resolve(doc.content.size))).toBe(true)
  })

  it("disallows a gap cursor at the start and end of a document when adjacent to a textblock", () => {
    const doc = docWith(schema.node("paragraph", null, schema.text("hi")))

    expect(GapCursor.valid(doc.resolve(0))).toBe(false)
    expect(GapCursor.valid(doc.resolve(doc.content.size))).toBe(false)
  })

  it("allows a gap cursor at the start and end of a block when adjacent to an atom block", () => {
    const section = schema.node("section", null, [schema.node("atom_block")])
    const doc = docWith(section)

    const sectionStart = doc.resolve(1)
    const sectionEnd = doc.resolve(1 + section.content.size)

    expect(sectionStart.parent.type.name).toBe("section")
    expect(sectionEnd.parent.type.name).toBe("section")
    expect(GapCursor.valid(sectionStart)).toBe(true)
    expect(GapCursor.valid(sectionEnd)).toBe(true)
  })

  it("allows a gap cursor in an empty block", () => {
    const section = schema.node("maybe_section")
    const doc = docWith(section)

    const maybeSectionStart = doc.resolve(1)
    const maybeSectionEnd = doc.resolve(1 + section.content.size)

    expect(maybeSectionStart.parent.type.name).toBe("maybe_section")
    expect(maybeSectionEnd.parent.type.name).toBe("maybe_section")
    expect(GapCursor.valid(maybeSectionStart)).toBe(true)
    expect(GapCursor.valid(maybeSectionEnd)).toBe(true)
  })
})
