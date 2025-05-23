Bugfix: Add src attribute to external app iframe

This adds the `src` attribute to the external app iframe using the `POST` request.
Some external apps like Collabora and OnlyOffice are using the `POST` requests to load the app with authenticated user.
`src` attribute was in that case omitted as it was not necessarily needed. That however introduced a bug with permissions propagation.
Any custom permissions set on the iframe like `camera` were not propagated to the final website. Adding the `src` attribute should ensure that the permissions are propagated.

https://github.com/owncloud/web/pull/12598
https://github.com/owncloud/web/issues/12121
