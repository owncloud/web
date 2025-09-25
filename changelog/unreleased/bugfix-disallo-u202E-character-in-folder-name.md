Bugfix: Disallow U+202E character in folder name

We have fixed an issue where the U+202E (Right-to-Left Override) character could be used in folder names, which could lead to confusion and potential security risks. This character is now disallowed in folder names to ensure clarity and prevent misuse.

https://github.com/owncloud/web/pull/13136
https://kiteworks.atlassian.net/browse/OCISDEV-124
