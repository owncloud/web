Enhancement: Strip WebDAV prefix

Added a new logic to the WebDAV client to strip the prefix from the path if it is present. Previously, only `/dav/` prefix would be stripped when parsing the response.
Now, it will strip all the parts of the base remote URL. For example, if the base remote URL is `https://example.com/my/nested/path/`, it will strip the `/my/nested/path/dav/` prefix.

https://github.com/owncloud/web/pull/13545
