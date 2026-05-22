Bugfix: Fix space key selecting wrong resource

We have fixed a bug where pressing the space key in the file list or the space list would select the wrong resource. This issue was caused by a mismatch between the index of the selected item and the index of the item in the file list.

https://kiteworks.atlassian.net/browse/OCISDEV-718
https://github.com/owncloud/web/pull/13634
