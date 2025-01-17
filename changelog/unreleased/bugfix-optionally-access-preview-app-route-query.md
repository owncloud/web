Bugfix: Optionally access preview app route query

We've fixed an issue where loading of preview app would fail due to missing route query. The route query is now accessed optionally meaning even when it undefined, the app still loads as expected.

https://github.com/owncloud/web/pull/12112
https://github.com/owncloud/web/issues/12108
https://github.com/owncloud/web/issues/12106
