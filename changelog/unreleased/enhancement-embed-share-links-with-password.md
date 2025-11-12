Enhancement: Embed mode share links with password

In embed mode, the "Copy link and password" button text has been changed to "Share link(s) and password(s)".
When sharing links in embed mode, a new event `owncloud-embed:share-links` is now emitted that contains an array of objects with the link URL and optionally the password (when the "Share link(s) and password(s)" button is clicked).
This allows parent applications to handle both the link and password programmatically.

DEPRECATION NOTICE: This deprecates the `owncloud-embed:share` event. The existing event continues to be emitted for backward compatibility.

https://github.com/owncloud/web/pull/13296
