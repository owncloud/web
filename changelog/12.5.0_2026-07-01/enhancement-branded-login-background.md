Enhancement: ownCloud branded login background

The default login page background has been replaced with the ownCloud branding
background. The background image is now applied through the CSS custom
property `--oc-login-background-image`, so a future branding update only needs
to change one value. The image itself still comes from the theme
(`loginPage.backgroundImg` in theme.json) and remains fully customizable.

https://github.com/owncloud/web/pull/13875
