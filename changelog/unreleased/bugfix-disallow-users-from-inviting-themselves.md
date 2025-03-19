Bugfix: disallow user from inviting themselves

We've fixed the issue where users were allowed to accept invitations from their own generated token link by disabling the accept invitation button when user is using their own generated token link.

https://github.com/owncloud/web/pull/12328
https://github.com/owncloud/web/issues/12183
