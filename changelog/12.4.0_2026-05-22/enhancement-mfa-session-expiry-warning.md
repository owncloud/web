Enhancement: MFA session expiry warning

We've added a warning modal that notifies users before their multi-factor authentication session expires. Users can extend the session via silent OIDC renewal or dismiss the warning. The modal state is synchronized across multiple browser tabs using a BroadcastChannel.

https://github.com/owncloud/web/pull/13803
