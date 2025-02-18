Enhancement: Allow camera in external app iframe

We've added the `allow` attribute with value `camera` to iframe in external app so that we allow using camera in external apps. We are not specifying any allowed origins and allow it everywhere as we are already allowing only certain origins to be loaded inside of the iframe.

https://github.com/owncloud/web/pull/12188
https://github.com/owncloud/web/issues/12121
