Bugfix: Remove anchor on last breadcrumb segment

The last segment of the breadcrumb was clickable, while it's expected that nothing happens (as it is the current path). We fixed that, the last breadcrumb element is not clickable anymore.

https://github.com/owncloud/phoenix/issues/3722
https://github.com/owncloud/phoenix/issues/2965
https://github.com/owncloud/phoenix/pull/3723
