import {EditorView} from "prosemirror-view"
import {EditorState} from "prosemirror-state"
import {DOMParser, Schema}  from "prosemirror-model"
import {schema as baseSchema}  from "prosemirror-schema-basic"
import {exampleSetup}  from "prosemirror-example-setup"
import {baseKeymap}  from "prosemirror-commands"
import {keymap}  from "prosemirror-keymap"

import {blockCursor} from "./src"

let schema = baseSchema

let doc = DOMParser.fromSchema(schema).parse(document.querySelector("#content"))
let state = EditorState.create({doc, plugins: [
  blockCursor(),
  keymap(baseKeymap)
].concat(exampleSetup({schema}))})

window.view = new EditorView(document.querySelector("#editor"), {state})

document.execCommand("enableObjectResizing", false, false)
document.execCommand("enableInlineTableEditing", false, false)
