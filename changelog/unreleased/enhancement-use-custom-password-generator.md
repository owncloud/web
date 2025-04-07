Enhancement: Use custom password generator

Use custom password generator implementation instead of the previously used package. The previous implementation was using `Math.random()` which is not cryptographically secure. The new implementation uses the Web Crypto API.

https://github.com/owncloud/web/pull/12424
https://github.com/owncloud/web/issues/10461
