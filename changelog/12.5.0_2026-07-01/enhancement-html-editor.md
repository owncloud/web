Enhancement: Add an HTML editor app

We added a new app, `web-app-html-editor`, that opens `.html`, `.htm` and `.xhtml`
files in a CodeMirror source editor with a live preview. The file is loaded and saved
over WebDAV by the standard app wrapper, and the document is rendered in a strictly
sandboxed iframe (opaque origin, no network egress) with Editor, Split and Preview
view modes. The app is registered by file extension and follows the same thin pattern
as the text editor.

https://github.com/owncloud/web/pull/13895
