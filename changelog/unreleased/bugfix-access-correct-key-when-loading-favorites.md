Bugfix: Access correct key when loading favorites

When loading favorites, we were trying to build resources by mapping the response object itself.
This was throwing an error because the response object is not a list.
We are now using the `results` property of the response object to access the list of favorite resources.

https://github.com/owncloud/web/pull/12606
