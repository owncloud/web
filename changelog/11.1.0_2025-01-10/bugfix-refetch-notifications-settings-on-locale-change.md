Bugfix: Refetch notifications settings on locale change

We've fixed an issue where the notification settings section did not update any strings when users changed their locale. The settings bundle is now fetched again when locale changes to make sure that the oCIS server can return strings in the correct locale.

https://github.com/owncloud/web/pull/12074
https://github.com/owncloud/web/issues/12064
