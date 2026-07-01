Bugfix: Use authMfaRequiredLevelname from capabilities instead of hardcoded value

The MFA required ACR level for vault routes is now read from the capabilities store (`authMfaRequiredLevelname`) instead of being hardcoded to `"advanced"`. This ensures the correct level is always used as configured by the server.

https://github.com/owncloud/web/pull/13907
