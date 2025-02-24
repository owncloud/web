Bugfix: Preserve current language in password protected folder view

We've added the new `lang` URL query param to the URL of password protected folder iframe to preserve the language settings. The value is set to the currently used language.

https://github.com/owncloud/web/pull/12206
https://github.com/owncloud/web/issues/12186
