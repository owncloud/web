Bugfix: Handle direct admin settings access

Opening the admin settings directly by pasting the URL in the browser address bar or opening the app in a new tab now works correctly.
The redirect was not correctly using the navigation guard leading to a mismatch in users permissions.
We now redirect to the first available route and leave the route itself to handle the permissions navigation guard.

https://github.com/owncloud/web/pull/12780