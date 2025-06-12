Bugfix: Load ancestor space only when parent id is returned

When loading ancestor meta data, we were trying to load the space even when the parent ID was not returned by the API.
We are now only loading the space when the parent ID is returned.

https://github.com/owncloud/web/pull/12607
