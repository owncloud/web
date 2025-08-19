Enhancement: Add universal access

We've added a new dropdown menu to the top bar and a new link to the user menu that allows users to access the accessibility options.
This change is necessary for accessibility compliance.
Both dropdown menu and user menu link are only shown if the theme provides the necessary URLs.

To set the URLs, you need to add the following to your theme:

```
{
  "common": {
    "urls": {
      "universalAccessEasyLanguage": "<url>",
      "universalAccessSignLanguage": "<url>",
      "accessibilityStatement": "<url>"
    }
  },
  "clients": {
    "web": {
      "defaults": {
        "icons": {
          "universalAccess": "<url>",
          "universalAccessEasyLanguage": "<url>",
          "universalAccessSignLanguage": "<url>"
        }
      }
    }
  }
}
```

https://github.com/owncloud/web/pull/12933
