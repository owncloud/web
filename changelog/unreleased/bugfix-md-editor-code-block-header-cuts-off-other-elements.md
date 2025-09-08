Bugfix: Set md-editor code block header to have z-index of 0

We have fixed an issue where the code block header in the markdown editor was cutting off other elements on the page. This has been resolved by setting the z-index of the code block header to 0.

https://kiteworks.atlassian.net/browse/OCISDEV-307
https://github.com/owncloud/web/pull/13075
