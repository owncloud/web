Bugfix: Disable cutting and pasting into the same folder

We've fixed the issue where users were allowed to cut and paste files into the same folder, either by clicking on the "Paste" button or by using keyboard paste shortcuts. This fix ensures that the paste operation is only allowed when the destination folder is different from the source folder, preventing invalid file operations.

https://github.com/owncloud/web/pull/12265
https://github.com/owncloud/web/issues/12021
