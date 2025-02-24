Bugfix: Skip upload dropzone init when files view is missing

We've fixed an issue where the drag & drop upload zone was being initialized even though the target files view element was missing. The initialization will be skipped now in such case.

https://github.com/owncloud/web/pull/12178
https://github.com/owncloud/web/issues/12150
