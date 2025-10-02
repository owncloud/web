Bugfix: Make progress bar settings reactive

We had a bug where the progress bar settings were not reactive. This caused labels to not be updated when the language changed.
Adding reactivity to the progress bar settings fixes this issue.

https://github.com/owncloud/web/pull/13126
