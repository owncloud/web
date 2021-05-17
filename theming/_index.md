
---
title: "Theming"
date: 2021-04-01T00:00:00+00:00
weight: 55
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/theming
geekdocFilePath: _index.md
geekdocCollapseSection: true
---

{{< toc >}}

## Introduction

By providing your own theme, you can customize the user experience for your own ownCloud installation. This is being achieved by providing a `json` file that contains text snippets (like brand name and slogan), paths to images (e.g. logos or favicon) and design tokens for custom colors (font size and spacing aren't yet supported).

This page documents the setup and configuration options, and provides an empty template for you to get started.

## Ways of providing a theme

Generally, your theming configuration lives inside a `.json` file, e.g. `theme.json`. To load this file, it needs to be correctly referenced inside your `config/config.json` (example configurations can be [found on GitHub](https://github.com/owncloud/web/tree/master/config)).

To reference your theme, you have two options:

- Using a URL, e.g. `"theme": "https://externalurl.example.com/theme-name/theme.json",`. To avoid CORS issues, please make sure that you host the URL on the same URL as your ownCloud web hosting.
- For development and testing purposes, you can store your `theme.json` inside `packages/web-runtime/themes/{theme-name}/` and reference it in the `config.json`. However, this isn't recommended for production use since your changes may get lost when updating oCIS or the `web` app in OC10.

**Hint:** If no theme is provided or the loading of your custom theme fails, the standard ownCloud theme will be loaded as a fallback. However, this doesn't stop you from correctly loading a theme that is wrongly formatted, so please read the instructions below carefully.

## Configuring a theme

Inside your `theme.json`, you can provide multiple themes as first-level objects. Currently, only the one called `"default"` gets applied when the frontend application is started.

You can use the snippet below as a base for writing your own theme by replacing the strings and image file paths accordingly. Also, make sure to delete the comments from the file.

```json
{
  "default": {
    // a theme named `default` is expected to 
    // be present and gets applied initially
    "general": {
      "name": "ownCloud",
      "slogan": "ownCloud – A safe home for all your data"
    },
    "logo": {
      // Reference URL paths for assets when using a remote theme
      "sidebar": "https://externalurl.example.com/theme-name/assets/logo.svg",
      "favicon": "https://externalurl.example.com/theme-name/assets/favicon.jpg",
      // Example use of relative paths for usage with a local theme inside packages/web-runtime/themes/
      "login": "themes/owncloud/assets/logo.svg"
    },
    "loginPage": {
      "autoRedirect": true,
      "backgroundImg": "themes/owncloud/assets/loginBackground.jpg"
    },
    "designTokens": {
      // please see the section on Design Tokens below
    }
  },
  "alternative": {
    // you can provide multiple themes inside your `.json` file
    // currently that doesn't do anything, but we'll provide
    // functionality to dynamically switch between themes in the future
  }
}
```

See below for the meaning of all the first-level objects inside a single theme and recommendations on how to make best use of them:

## The "general" options

Here, you can specify a `"name"` and a `"slogan"` string. The name gets used in the HTML page `<title>`, and both of them are shown on various screens (e.g. login, loading, error and public share pages).

## The "logo" options

Here, you can specify the images to be used in the `"sidebar"`, for the `"favicon"` and on the `"login"` page. Various formats are supported and it's up to you to decide which one fits best to your use case.

## The "loadingPage" options

Using the `"autoRedirect"` boolean, you can specify whether the user is shown a login page before possible getting redirected to your LDAP/OIDC/OAuth provider. If it is set to true, you can set the background image for said login page by providing an image file in the `"backgroundImg"` option.

## Design Tokens

To further customize your ownCloud instance, you can provide your own styles. To give you an idea of how a working design system looks like, feel free to head over to the [ownCloud design tokens](https://owncloud.design/#/Design%20Tokens) for inspiration.


**Hint:** All the variables are initialized using the [ownCloud design tokens](https://owncloud.design/#/Design%20Tokens) and then overwritten by your theme variables. Therefore, you don't have to provide all the variables and can use the default ownCloud colors as a fallback.

In general, the theme loader looks for a `designTokens` key inside your theme configuration. Inside the `designTokens`, it expects to find a `colorPalette`, `fontSize` and `spacing` collection (ony `colorPalette` is being used right now, see below for details).

```json
{
  "default": {
    "general": {
      // ...
    },
    "designTokens": {
      "colorPalette": {
        // ...
      },
      "fontSizes": {
        // ...
      },
      "sizes": {
        // ...
      },
      "spacing": {
        // ...
      }
    }
  }
}
```

Please follow this structure to make sure your theming configuration can be loaded correctly.

### Extendability

If you define different key-value pairs inside any of the objects in `"designTokens"`, they will get loaded and initialized as CSS custom properties but don't take any effect in the user interface. This gives you an opportunity to, for example, customize extensions from within the theme in the web runtime (and not the extension itself).
### Colors

For the color values, you can use any valid CSS color format, e.g. **hex** (#fff), **rgb** (rgb(255,255,255)) or **color names** (white).

Color variables get prepended with `--oc-color-`, so e.g. *"background-default"* creates the custom CSS property `--oc-color-background-default`.

Again, you can use the [ownCloud design tokens](https://owncloud.design/#/Design%20Tokens) as a reference implementation.

```json
{
  "default": {
    "general": {
      // ...
    },
    "designTokens": {
      "colorPalette": {
        "background-default": "",
        "background-highlight": "",
        "background-muted": "",
        "border": "",
        "input-bg": "",
        "input-border": "",
        "input-text-default": "",
        "input-text-muted": "",
        "swatch-brand-default": "",
        "swatch-brand-hover": "",
        "swatch-danger-default": "",
        "swatch-danger-hover": "",
        "swatch-danger-muted": "",
        "swatch-passive-default": "",
        "swatch-passive-hover": "",
        "swatch-passive-muted": "",
        "swatch-primary-default": "",
        "swatch-primary-hover": "",
        "swatch-primary-muted": "",
        "swatch-success-default": "",
        "swatch-success-hover": "",
        "swatch-success-muted": "",
        "swatch-warning-default": "",
        "swatch-warning-hover": "",
        "swatch-warning-muted": "",
        "text-default": "",
        "text-inverse": "",
        "text-muted": ""
      },
      "fontSizes": {
        "default": "",
        "large": "",
        "medium": ""
      },
      "size": {
        "form-check-default": "",
        "height-small": "",
        "height-table-row": "",
        "icon-default": "",
        "width-medium": ""
      },
      "spacing": {
        "xsmall": "",
        "small": "",
        "medium": "",
        "large": "",
        "xlarge": "",
        "xxlarge": ""
      }
    }
  }
}
```

### Font sizes

You can change the `default`, `large` and `medium` font sizes according to your needs. If you need more customization options regarding font sizes, please [open an issue on GitHub](https://github.com/owncloud/web/issues/new) with a detailed description.

Font size variables get prepended with `--oc-font-size-`, so e.g. *"default"* creates the custom CSS property `--oc-font-size-default`.
### Sizes

You can change the `form-check-default` (checkbox sizing), `height-small` (height of the logo img in the sidebar), `icon-default` (icon base size) and `width-medium` (width of the sidebar) according to your needs. If you need more customization options regarding sizes, please [open an issue on GitHub](https://github.com/owncloud/web/issues/new) with a detailed description.

Size variables get prepended with `--oc-size-`, so e.g. *"icon-default"* creates the custom CSS property `--oc-size-icon-default`.

### Spacing

Use the six spacing options (`xsmall | small | medium | large | xlarge | xxlarge`) to create a more (or less) condensed version of the user interface. If you need more customization options regarding sizes, please [open an issue on GitHub](https://github.com/owncloud/web/issues/new) with a detailed description.

Spacing variables get prepended with `--oc-space-`, so e.g. *"xlarge"* creates the custom CSS property `--oc-space-xlarge`.
## Example theme

An empty template for your custom theme is provided below, and you can use the instructions above to set it up according to your needs. Please note that since changing themes at runtime is not yet supported it only consists of a `default` theme, and the `fontSizes` and `spacing` tokens don't have any effect yet.

```json
{
  "default": {
    "general": {
      "name": "",
      "slogan": ""
    },
    "logo": {
      "sidebar": "",
      "favicon": "",
      "login": "",
      "notFound": ""
    },
    "loginPage": {
      "autoRedirect": true,
      "backgroundImg": ""
    },
    "designTokens": {
      "colorPalette": {
        "background-default": "",
        "background-highlight": "",
        "background-muted": "",
        "border": "",
        "input-bg": "",
        "input-border": "",
        "input-text-default": "",
        "input-text-muted": "",
        "swatch-brand-default": "",
        "swatch-brand-hover": "",
        "swatch-danger-default": "",
        "swatch-danger-hover": "",
        "swatch-danger-muted": "",
        "swatch-passive-default": "",
        "swatch-passive-hover": "",
        "swatch-passive-muted": "",
        "swatch-primary-default": "",
        "swatch-primary-hover": "",
        "swatch-primary-muted": "",
        "swatch-success-default": "",
        "swatch-success-hover": "",
        "swatch-success-muted": "",
        "swatch-warning-default": "",
        "swatch-warning-hover": "",
        "swatch-warning-muted": "",
        "text-default": "",
        "text-inverse": "",
        "text-muted": ""
      },
      "fontSizes": {
        "default": "",
        "large": "",
        "medium": ""
      },
      "sizes": {
        "form-check-default": "",
        "height-small": "",
        "height-table-row": "",
        "icon-default": "",
        "width-medium": ""
      },
      "spacing": {
        "xsmall": "",
        "small": "",
        "medium": "",
        "large": "",
        "xlarge": "",
        "xxlarge": ""
      }
    }
  }
}
```
