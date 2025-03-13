Bugfix: Add password policies to password protected folders

We've added password policies to the password protected folders so that the creation of the folder does not fail with a generic error message and to prevent the user from even continuing with the creation of the folder if the password does not meet the policy.

https://github.com/owncloud/web/pull/12240
https://github.com/owncloud/web/issues/12223
