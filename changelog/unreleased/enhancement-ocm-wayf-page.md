Enhancement: Add WAYF page for OCM

We've implemented a Where Are You From page that allows users to discover and select their cloud provider when accepting federated invitations.
The new page includes federation browsing, provider search functionality, and manual provider entry with automatic OCM discovery.

The implementation added new routes (`/wayf` and `/accept-invite`) with anonymous authentication support, enabling users to access the provider selection interface without prior authentication.
Outgoing invitations now include multiple token copy options (plain, base64, and WAYF link) for improved sharing flexibility.

Enhancements prevent users from accepting self-generated invitations and automatically exclude the current instance from available provider lists.

https://github.com/owncloud/web/pull/13243
