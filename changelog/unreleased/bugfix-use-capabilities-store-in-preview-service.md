Bugfix: Use capabilities store in preview service

When preview service was initialised, the user is not yet logged in and the capabilities store is not yet initialised.
Assigning then values from the capabilities store directly to the preview service was causing an error.
Adding the store itself into the service and accessing the values from there ensures that the values are up to date.

https://github.com/owncloud/web/pull/12628
