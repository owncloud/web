import { RouteLocation, RouteLocationNormalizedLoaded, RouteLocationRaw, Router } from 'vue-router'
import get from 'lodash-es/get'

// type: patch
// temporary patch till we have upgraded web to the latest vue router which make this obsolete
// this takes care that routes like 'foo/bar/baz' which by default would be converted to 'foo%2Fbar%2Fbaz' stay as they are
// should immediately go away and be removed after finalizing the update
// to apply the patch to a route add meta.patchCleanPath = true to it
// to patch needs to be enabled on a route level, to do so add meta.patchCleanPath = true property to the route
// c.f. https://github.com/vuejs/router/issues/ 1638
export const patchRouter = (router: Router) => {
  const bindResolver = router.resolve.bind(router)
  const cleanPath = (route) =>
    [
      ['%2F', '/'],
      ['//', '/']
    ].reduce((path, rule) => path.replaceAll(rule[0], rule[1]), route || '')

  router.resolve = (
    raw: RouteLocationRaw,
    currentLocation?: RouteLocationNormalizedLoaded
  ): RouteLocation & {
    href: string
  } => {
    const bindResolve = bindResolver(raw, currentLocation)

    if (!get(bindResolve, 'meta.patchCleanPath', false)) {
      return bindResolve
    }

    return {
      ...bindResolve,
      href: cleanPath(bindResolve.href),
      path: cleanPath(bindResolve.path),
      fullPath: cleanPath(bindResolve.fullPath)
    }
  }

  return router
}
