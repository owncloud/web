/**
 * we need to inject the vue files into the route builders,
 * this is because we also import the provided helpers from other js|ts files
 * like mixins, rollup seems to have a problem to import files which contain vue file imports
 * into js files which then again get imported by other vue files...
 */
export interface RouteComponents {
  App: any
  Favorites: any
  FilesDrop: any
  LocationPicker: any
  PrivateLink: any
  PublicFiles: any
  Personal: any
  PublicLink: any
  SharedWithMe: any
  SharedWithOthers: any
  SharedViaLink: any
  Spaces: any
  Trashbin: any
}
