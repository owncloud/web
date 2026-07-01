Enhancement: Save a copy of office documents to another format (Collabora)

Office documents opened in Collabora Online could be renamed but not saved as a
copy or exported to another format back into oCIS storage: "Save As" silently
did nothing. Collabora exposes "Save As" as a host-delegated operation - it
posts a `UI_SaveAs` message and waits for the integration to reply with the
target filename via `Action_SaveAs` - but the app-provider integration never
opened that postMessage channel.

The app-provider now announces itself to the editor with `Host_PostmessageReady`
once the iframe has loaded, requests the grouped Save-As control via
`ui_defaults` (`SaveAsMode=group`), and on `UI_SaveAs` prompts for the copy's
name and replies with `Action_SaveAs`. The collaboration service already
implements WOPI `PutRelativeFile`, so the copy is written into the same space,
respecting the user's permissions. The chosen file extension selects the export
format (e.g. docx to pdf/odt, xlsx to ods, pptx to pdf).

https://github.com/owncloud/web/pull/13906
