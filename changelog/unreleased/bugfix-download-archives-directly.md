Bugfix: Download archives directly

In authenticated context and inside public links without a password, download zip archives directly by opening the download URL instead of fetching it first. Fetching the archive first puts constraints on the size of the archive that can be downloaded because it is being saved into the devices memory. In case of a public link with a password, the archive is still being fetched because signed URLs are not supported for public links.

https://github.com/owncloud/web/pull/12406
https://github.com/owncloud/web/issues/12405
