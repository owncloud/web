import Router from 'vue-router'
import get from 'lodash-es/get'

// type: patch
// temporary patch till we have upgraded web to the latest vue router which make this obsolete
// this takes care that routes like 'foo/bar/baz' which by default would be converted to 'foo%2Fbar%2Fbaz' stay as they are
// should immediately go away and be removed after finalizing the update
// to apply the patch to a route add meta.patchCleanPath = true to it
// to patch needs to be enabled on a route level, to do so add meta.patchCleanPath = true property to the route
export const patchRouter = (router: Router) => {
  const bindMatcher = router.match.bind(router)
  const cleanPath = (route) =>
    [
      ['%2F', '/'],
      ['//', '/']
    ].reduce((path, rule) => path.replaceAll(rule[0], rule[1]), route || '')

  router.match = (raw, current, redirectFrom) => {
    const bindMatch = bindMatcher(raw, current, redirectFrom)

    if (!get(bindMatch, 'meta.patchCleanPath', false)) {
      return bindMatch
    }

    return {
      ...bindMatch,
      path: cleanPath(bindMatch.path),
      fullPath: cleanPath(bindMatch.fullPath)
    }
  }

  return router
}
