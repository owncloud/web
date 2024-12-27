Bugfix: Use local state in sidebar in embed mode

We've fixed an issue where the sidebar would be overlapping the content of embed mode iframe when opened due to shared local storage. We now use own local state for the sidebar in embed mode instead of relying on the local storage.

https://github.com/owncloud/web/pull/12058
https://github.com/owncloud/web/issues/11875
