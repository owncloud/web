Bugfix: Pass vault parameter to capabilities endpoint

We've fixed the capabilities request to include the `vault=true` query parameter when the application is in vault mode. This ensures the backend returns vault-specific capabilities. The OCS client is now reinitialized with the correct base URL when vault mode is detected, following the same pattern as the graph client.

https://github.com/owncloud/web/pull/0000
