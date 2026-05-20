Bugfix: Fix upload confirmation not visible on file drop page

We've fixed a responsive layout issue where the upload confirmation message was not visible at small browser window sizes on the file drop page. The `UploadInfo` panel was being clipped due to broken CSS. The layout now uses natural document flow so the confirmation is always visible regardless of viewport size.

https://github.com/owncloud/web/pull/13796
