Bugfix: Handle HTML upload error

We had a bug where the upload error was not handled correctly when the server returned an HTML error.
This caused the upload to fail and the user to not be able to see details about the upload.

https://github.com/owncloud/web/pull/13127
