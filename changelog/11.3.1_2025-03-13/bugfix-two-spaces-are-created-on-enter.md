Bugfix: Two spaces are created at the same time when user tries to create a space

This bugfix addresses an issue where pressing the Enter key in a modal to create a space or folder results in the creation of two spaces or folders instead of just one. The fix ensures that only a single space or folder is created when the Enter key is pressed.

https://github.com/owncloud/web/pull/12297
https://github.com/owncloud/web/issues/12276
