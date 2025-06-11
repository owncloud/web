Bugfix: Make password protected folder tile clickable

We've fixed an issue where the password protected folder resource was not clickable when the files list is in "Tiles" view mode. Due to missing permissions on the resource, the click was disabled. We have added a new check that asserts whether the resource is a password protected folder and if yes, we allow the click.

https://github.com/owncloud/web/pull/12227
https://github.com/owncloud/web/issues/12193
