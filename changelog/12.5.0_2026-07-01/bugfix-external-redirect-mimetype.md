Bugfix: Open external apps based on the file mime type

We've fixed the external app redirect (`/external`) picking an arbitrary app when no `app`
query parameter was present. It fell back to the first registered app provider, which might
not support the file's mime type, so the following request to open the file failed with an
"app not found" error that surfaced as a generic error to the user.

The redirect now resolves the app from the file's mime type, preferring the configured
default application, and shows an explicit error when no suitable app is available instead of
silently redirecting to the wrong one.

https://github.com/owncloud/web/pull/13888
