Bugfix: Do not disable sharing of resources when managing spaces via claims

When managing spaces via claims, we were disabling sharing of resources when the server managed spaces capability was enabled.
This was not correct, as we should only disable sharing of spaces.

https://github.com/owncloud/web/pull/13213
