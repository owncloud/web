Enhancement: Handle Collabora insert remote file and image postMessages

Handle UI_InsertGraphic and UI_InsertFile postMessages from Collabora Online,
enabling remote image insertion, multimedia insertion, and document comparison
features. Opens a file picker modal, resolves the selected file to a download
URL, and sends the result back to Collabora. Also adds the Host_PostmessageReady
handshake required by Collabora before it accepts Action postMessages.

Requires Collabora Online >= 24.04.10 for multimedia insertion, >= 25.04.9.1
for document comparison. Companion server-side PR: owncloud/ocis#12192.

https://github.com/owncloud/web/pull/13658
