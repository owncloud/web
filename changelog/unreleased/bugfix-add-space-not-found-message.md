Bugfix: Add space not found message

We've added a space not found message. If users are trying to open a space that does not exist or users has not got access to it, the error message will be shown instead of users being redirected to their personal space.

The error message will be shown in the following cases:

- The space does not exist
- The space exists but the user has no access to it

https://github.com/owncloud/web/pull/12373
https://github.com/owncloud/web/issues/11014