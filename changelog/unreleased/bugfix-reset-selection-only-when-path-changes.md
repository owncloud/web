Bugfix: Reset selection only when path changes

We've changed the way we reset the selection when the route changes.

Previously, we were resetting the selection when the route changed, but this was not
working as expected. For example, when updating `scrollTo` route query, the selection
was being unintentionally reset.

Now, we're only resetting the selection when the path changes.

https://github.com/owncloud/web/pull/12768
https://github.com/owncloud/web/issues/10398
