Bugfix: Add explicit size to space header image

The space header image did not have explicit width and height causing the image to overflow its container.
Adding explicit width and height with values of 100% makes sure that the image stays within the boundaries of the container.

https://github.com/owncloud/web/issues/13822
https://github.com/owncloud/web/pull/13835
