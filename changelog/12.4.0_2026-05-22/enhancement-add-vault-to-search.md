Enhancement: Add vault search separation

We've implemented vault search separation by adding the `vault:true` query token to the `<oc:pattern>` search payload. The token is now included in both "All files" and "Current folder" search requests, ensuring vault content is correctly scoped in all search scenarios.

https://github.com/owncloud/web/pull/13769
