Bugfix: Fix theme switching issues

When switching between themes, colors could get stuck or become unreadable until a page refresh.
Empty string values in theme tokens were overriding stylesheet defaults with nothing, making elements invisible.
Additionally, tokens from the previous theme were not cleared before applying the new theme, causing stale values to persist.
We now remove previous theme properties before applying the new theme and treat empty token values as unset.
We also fixed the cancel button in the password protected folder modal being invisible because its color matched the dark action bar background.

https://github.com/owncloud/web/pull/13843
