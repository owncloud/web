Enhancement: Drop `remote.php` from WebDAV paths

We have dropped the `remote.php` prefix from WebDAV paths.
This is not a breaking change because oCIS strips this string from the path and it had been done in the past only to support ownCloud 10.

https://github.com/owncloud/web/pull/13113
