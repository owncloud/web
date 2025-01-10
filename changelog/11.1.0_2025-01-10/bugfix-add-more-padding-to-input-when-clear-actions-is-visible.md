Bugfix: Add more padding to input when clear action is visible

We've fixed the issue where the clear action of the text input would overlap the text entered into the input. When the clear action becomes visible, the right padding of the input will be increased by the size of the clear action.

https://github.com/owncloud/web/pull/12055
https://github.com/owncloud/web/issues/11543
