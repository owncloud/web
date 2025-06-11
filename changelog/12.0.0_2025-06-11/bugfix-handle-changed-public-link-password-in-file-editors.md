Bugfix: Handle changed public link password in file editors

Refreshing a file editor while having a file shared via public link opened will no longer display an error that username or password is incorrect when the public link password has been changed. Instead, it will correctly redirect to the public link password screen where user can enter new password and continue editing the file afterwards.

https://github.com/owncloud/web/pull/12357
https://github.com/owncloud/web/issues/12113
