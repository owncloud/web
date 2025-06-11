Bugfix: Delete .psec file

We've extended the deletion of resources to also delete `.psec` file when deleting its related folder in personal space. The deletion works only when the user has delete permissions on that `.psec` file and if the folder and path and name still match.

https://github.com/owncloud/web/pull/12329
https://github.com/owncloud/web/issues/12273