Bugfix: Handle file loading error

Skip loading file content if getting the file info fails. This prevents an unexpected error when opening a file.

https://github.com/owncloud/web/pull/13274
