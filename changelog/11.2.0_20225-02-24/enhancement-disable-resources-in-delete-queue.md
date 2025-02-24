Enhancement: Disable resources in delete queue

We've added a new delete queue which is used to disable resources that are being currently deleted. When the resource is in delete queue, it also replaces select checkbox with a spinner to better hint that there is an action in progress.

https://github.com/owncloud/web/pull/12046
https://github.com/owncloud/web/issues/11956
