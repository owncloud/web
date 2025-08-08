Bugfix: Incorrect translation when using switches language

We have fixed an issue where the translation was incorrect when switching languages in the web interface. This ensures that the language displayed matches the selected language without inconsistencies by fetching the roles when use switches language.

https://kiteworks.atlassian.net/browse/OCISDEV-186
https://github.com/owncloud/web/pull/12889
