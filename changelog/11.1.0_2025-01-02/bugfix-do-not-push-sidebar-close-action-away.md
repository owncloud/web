Bugfix: Do not push sidebar close action away

We've fixed an issue with the sidebar close action which was pushed away when zooming. The layout of the screen was not adjusting the size and shifted the whole sidebar off the screen. We set a fixed width of 100% - sidebar width to prevent this.

https://github.com/owncloud/web/pull/12045
https://github.com/owncloud/web/issues/11536
