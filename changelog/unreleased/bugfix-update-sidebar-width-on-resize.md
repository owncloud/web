Bugfix: Update sidebar width on resize

We've fixed an issue where the width of the sidebar was updated only when opening it. We added a resize event handler to the window object so that we can react to it and update the width accordingly.

https://github.com/owncloud/web/pull/12045
