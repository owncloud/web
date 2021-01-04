/**
 * Checks whether the user is currently in a given route
 * @param {Array} routes The array of routes which should be checked
 * @param {String} currentRoute The route that the user is currently in
 * @returns {Boolean}
 */
export function checkRoute(routes, currentRoute) {
  return routes.indexOf(currentRoute) > -1
}
