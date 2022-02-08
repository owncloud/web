import Vue, { ComponentOptions } from 'vue'

/**
 * we need to inject the vue files into the route builders,
 * this is because we also import the provided helpers from other js|ts files
 * like mixins, rollup seems to have a problem to import files which contain vue file imports
 * into js files which then again get imported by other vue files...
 */
export interface RouteComponents {
  App: ComponentOptions<Vue>
  Favorites: ComponentOptions<Vue>
  FilesDrop: ComponentOptions<Vue>
  LocationPicker: ComponentOptions<Vue>
  PrivateLink: ComponentOptions<Vue>
  PublicFiles: ComponentOptions<Vue>
  Personal: ComponentOptions<Vue>
  SearchResults: ComponentOptions<Vue>
  PublicLink: ComponentOptions<Vue>
  SharedResource: ComponentOptions<Vue>
  SharedWithMe: ComponentOptions<Vue>
  SharedWithOthers: ComponentOptions<Vue>
  SharedViaLink: ComponentOptions<Vue>
  Spaces: {
    Projects: ComponentOptions<Vue>
    Project: ComponentOptions<Vue>
    Trashbin: ComponentOptions<Vue>
  }
  Trashbin: ComponentOptions<Vue>
  Home: ComponentOptions<Vue>
}
