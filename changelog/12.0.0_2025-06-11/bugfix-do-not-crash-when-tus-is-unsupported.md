Bugfix: Do not crash when tus is unsupported

When TUS is not supported, we were not setting a fallback value. This was causing the app to crash.
We're now setting an empty string as fallback value so that we can still call `includes` method and not crash the app.

https://github.com/owncloud/web/pull/12608
