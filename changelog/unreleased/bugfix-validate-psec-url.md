Bugfix: Validate URL before opening password-protected folder

We've fixed an issue where the URL stored inside a `.psec` file was not validated before
being used as the source of the folder view iframe. The URL is now checked to ensure it
uses a safe scheme and points to the configured ownCloud server.

https://github.com/owncloud/web/pull/13924
