Bugfix: Do not render default actions in context menu

We've fixed an issue where the default action was rendered in the context menu leading into duplicate actions being shown. The default action was originally introduced into the context menu to show "Open folder" action of password protected folders extension but we fixed this to use the correct category in the extension which renders the action as expected.

https://github.com/owncloud/web/pull/12175
https://github.com/owncloud/web/issues/12154
