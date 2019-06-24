## 1.0.4 (2019-06-24)

### Bug fixes

Do not show a gap cursor when the view isn't editable.

## 1.0.3 (2018-10-01)

### Bug fixes

Don't blanket-forbid gap cursors next to textblocks

## 1.0.2 (2018-03-15)

### Bug fixes

Throw errors, rather than constructing invalid objects, when deserializing from invalid JSON data.

## 1.0.1 (2018-02-16)

### Bug fixes

Prevent issue where clicking on a selectable node near a valid gap cursor position would create a gap cursor rather than select the node.

## 1.0.0 (2017-10-13)

### New features

Valid gap cursor positions are not determined in a way that allows them inside nested nodes. By default, any position where a textblock can be inserted is valid gap cursor position.

Nodes can override whether they allow gap cursors with the `allowGapCursor` property in their spec.

## 0.23.1 (2017-09-19)

### Bug fixes

Moving out of a table with the arrow keys now creates a gap cursor when appropriate.

