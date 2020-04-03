Bugfix: fix oidc redirect after logout 

After the logout the idp sent a redirect to `<redirectUri>?state=` which was then redirected to `<redirectUri>?state=#/login` by phoenix. Having the query parameters in between broke the application. To prevent the whole login url `<baseUrl>#/login` should be sent then the query parameter will be appended to the end.

https://github.com/owncloud/phoenix/issues/3285
