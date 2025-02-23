Bugfix: Prevent password protected folder move

We've fixed permissions on password protected folders so that the name of the resource is checked and if it ends with `.psec`, it cannot be moved.

https://github.com/owncloud/web/pull/12205
https://github.com/owncloud/web/issues/12198
