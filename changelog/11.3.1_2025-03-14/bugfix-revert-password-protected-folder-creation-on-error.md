Bugfix: Revert password protected folder creation on error

We've fixed an issue where the hidden folder with password protected files was not being deleted in case of an error with link or file creation.

https://github.com/owncloud/web/pull/12241
https://github.com/owncloud/web/issues/12223
