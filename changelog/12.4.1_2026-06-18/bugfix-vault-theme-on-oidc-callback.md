Bugfix: Apply vault theme after OIDC callback

When opening the vault for the first time, the user is redirected to an external IdP for 2FA.
Upon returning, the OIDC callback URL contains no vault context, causing the regular theme to be applied instead of the vault theme.
We now also check the stored post-login redirect URL during the OIDC callback to correctly detect vault mode.

https://github.com/owncloud/web/pull/13826
