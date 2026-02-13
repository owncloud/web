Enhancement: Use signature auth

When requesting resources from public links, we now request also `oc:signature-auth` property. This property is then used to sign the archiver download URL within password protected public links.

https://github.com/owncloud/ocis/issues/11963
https://github.com/owncloud/web/pull/13576
