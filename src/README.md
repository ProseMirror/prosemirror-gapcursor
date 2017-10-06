This is a plugin that adds a type of selection for focusing places
that don't allow regular selection (such as positions that have a leaf
block node, table, or the end of the document both before and after
them).

You'll probably want to load `style/block-cursor.css`, which contains
basic styling for the simulated cursor (as a short, blinking
horizontal stripe).

In some types of nodes, such as tables and table rows, you might want
to explicitly disallow gap cursors by adding an `allowGapCursor:
false` property to their node specs.

@gapCursor

@GapCursor
