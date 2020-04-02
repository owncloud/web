Bugfix: fix oidc redirect after logout 

Changed the redirect uri to not contain a trailing slash so that the redirect in the oidc provider works.

https://github.com/owncloud/phoenix/pull/3284/files
