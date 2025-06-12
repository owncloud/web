Bugfix: Reload preloaded resource in sidebar

We've fixed an issue where actions were not being updated on a resource. We are now reloading metadata of the resource even in the case when it is already preloaded so that we get up to date information.

https://github.com/owncloud/web/pull/12059
https://github.com/owncloud/web/issues/10748
