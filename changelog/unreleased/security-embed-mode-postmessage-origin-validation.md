Security: Validate postMessage origin in embed mode modals

We've fixed a cross-site request forgery (CSRF) vulnerability where the embed mode modals (Save As, Export As PDF and the file
picker) processed incoming `postMessage` events without verifying the sender's origin. A malicious page holding a reference to an
authenticated ownCloud window could forge `owncloud-embed:select`, `owncloud-embed:file-pick` or `owncloud-embed:cancel` messages
and trigger authenticated file writes in the victim's space. Incoming messages are now validated against an allowlist consisting of
the application's own origin and the optionally configured `embed.messagesOrigin`.

https://github.com/owncloud/web/issues/13844
