Bugfix: Request archive as blob

When downloading an archive in public links with passwords, the archive is now being fetched as a blob instead of a signed URL. This allows for downloading larger archives in Chrome and Firefox.

https://github.com/owncloud/web/pull/12406
https://github.com/owncloud/web/issues/12405