import Vue, { ComponentOptions } from 'vue'

/**
 * we need to inject the vue files into the route builders,
 * this is because we also import the provided helpers from other js|ts files
 * like mixins, rollup seems to have a problem to import files which contain vue file imports
 * into js files which then again get imported by other vue files...
 */
export interface RouteComponents {
  App: ComponentOptions<typeof Vue>
  Favorites: ComponentOptions<typeof Vue>
  FilesDrop: ComponentOptions<typeof Vue>
  PrivateLink: ComponentOptions<typeof Vue>
  SearchResults: ComponentOptions<typeof Vue>
  PublicLink: ComponentOptions<typeof Vue>
  Shares: {
    SharedWithMe: ComponentOptions<typeof Vue>
    SharedWithOthers: ComponentOptions<typeof Vue>
    SharedViaLink: ComponentOptions<typeof Vue>
  }
  Spaces: {
    DriveResolver: ComponentOptions<typeof Vue>
    Projects: ComponentOptions<typeof Vue>
  }
}
