# ownCloud Web - skeleton app

The skeleton APP serves as an example, the application should not be used in production because it offers no added value there.
Rather, it can be seen as a kit, a source of inspiration or a showcase and currently includes the following examples:

* a custom search provider which searches GitHub
* a custom app which renders its own top-level view

## Caveats
as mentioned above, the skeleton app is only intended for demonstration purposes,
so it is not part of the default apps and must be activated separately, the following steps are necessary:

* remove the app from the `ignoredPackages` array in the [vite config](../../vite.config.ts).
* add the skeleton app to the `config.json` apps array.

