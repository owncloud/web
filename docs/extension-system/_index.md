---
title: 'Extension system'
date: 2024-01-23T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/extension-system
geekdocFilePath: _index.md
geekdocCollapseSection: true
---

{{< toc >}}

The ownCloud Web can be extended through various entry points with custom **apps** and **extensions**.

## Concepts and building blocks

### Apps

#### Abstract

An Application in the context of ownCloud Web is an artifact which can be distributed to and installed by an ownCloud admin.
It serves two main purposes:
1. It makes the full app viewport (everything below the top bar) available to the application developer for any custom 
application code. This includes the ability to define views with routes, navigation items for the left side bar, and more.
2. Through the `extensions` key in the application interface the developer can register extensions of any extension type.
Those extensions will become available in standardized extension points and for being queried from the extension registry 
for custom use.

Both parts are optional. This means that an application can be a file editor without any custom extensions, or even contain
no custom application code at all and only host extensions to be registered in the extension registry, or a combination of both.

#### Technical Details

To get started, define a `src/index.ts`. Below is the most basic example of its content:

```ts
// Install '@ownclouders/web-pkg' as a dependency first
import {
  AppWrapperRoute,
  ApplicationFileExtension,
  defineWebApplication
} from '@ownclouders/web-pkg'


export default defineWebApplication({
  setup({ applicationConfig }) {
    // Here, you have access to the full injection context, meaning you can use all composable that we provide via web-pkg

    // Needs to be unique within all installed extensions in any ownCloud web instance
    // Should be short, unique and expressive as it gets prefixed on all routes within your application
    const appId = 'your-extension' 

    // See details below
    const extensions = [
        ...
    ]

    // See details below
    const routes = [
        ...
    ]

    return {
      appInfo: {
        name: $gettext('Your extension'),
        id: appId,
        icon: 'aliens', // See https://owncloud.design/#/Design%20Tokens/IconList for available options
      },
      extensions,
      routes
    }
  }
})
```

### Extensions

- What is an extension?
    - list of extension types
        - 
    - extension points (extension.ts)
        - was wird erweitert - Funktionalität
        - Extensions werden an/in Extension Points eingebunden
    - scopes - wo wird eine Extension verwendet? (e.g. wo wird eine `action` verwendet)
<!-- See if extension point/scope differentiation is still necessary after formulating text -->

- How do I create an extension => examples folder?


## Further information (digging deeper)

AKA "under the hood"

### Global Extension Registry

- What is Global Extension Registry?

### - What can / can't I do with an extension?



### js-package / commonjs-file

- current limitations

### extension-sdk

- Rename to application-sdk?
