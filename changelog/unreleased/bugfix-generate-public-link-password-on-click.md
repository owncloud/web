Bugfix: Generate public link password on click

We've fixed an issue where the password input was not generating a new password on click. The generate method was directly called instead of being passed as a callback.

https://github.com/owncloud/web/pull/12266
