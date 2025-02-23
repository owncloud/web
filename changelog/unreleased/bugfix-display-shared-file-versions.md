Bugfix: Display shared file versions

We've fixed an issue where versions were not displayed in the sidebar for a shared file even when shared with necessary permissions. If a resource is an incoming share, we are now checking permission directly on the resource object instead of space.

https://github.com/owncloud/web/pull/12194
https://github.com/owncloud/web/issues/12168
