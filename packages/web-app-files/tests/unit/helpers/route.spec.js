import {
  checkRoute,
  isAnySharedWithRoute,
  isFavoritesRoute,
  isPersonalRoute,
  isPublicFilesRoute,
  isPublicPage,
  isSharedWithMeRoute,
  isSharedWithOthersRoute,
  isTrashbinRoute
} from '@files/src/helpers/route.js'

describe('route', () => {
  describe('checkRoute', () => {
    it('should return "true" if given "routes" array contains given "currentRoute"', () => {
      expect(checkRoute(['some-route'], 'some-route')).toBe(true)
    })
    it('should return "false" if given "routes" array does not contains given "currentRoute"', () => {
      expect(checkRoute(['some-route'], 'another-route')).toBe(false)
    })
  })

  describe('isPersonalRoute', () => {
    it('should return "true" if given route name is "files-personal"', () => {
      expect(isPersonalRoute({ name: 'files-personal' })).toBe(true)
    })
    it('should return "false" if given route name is not "files-personal"', () => {
      expect(isPersonalRoute({ name: 'files-favorites' })).toBe(false)
    })
  })

  describe('isFavoritesRoute', () => {
    it('should return "true" if given route name is "files-favorites"', () => {
      expect(isFavoritesRoute({ name: 'files-favorites' })).toBe(true)
    })
    it('should return "false" if given route name is not "files-favorites"', () => {
      expect(isFavoritesRoute({ name: 'files-personal' })).toBe(false)
    })
  })

  describe('isTrashbinRoute', () => {
    it('should return "true" if given route name is "files-trashbin"', () => {
      expect(isTrashbinRoute({ name: 'files-trashbin' })).toBe(true)
    })
    it('should return "false" if given route name is not "files-trashbin"', () => {
      expect(isTrashbinRoute({ name: 'files-personal' })).toBe(false)
    })
  })

  describe('isSharedWithMeRoute', () => {
    it('should return "true" if given route name is "files-shared-with-me"', () => {
      expect(isSharedWithMeRoute({ name: 'files-shared-with-me' })).toBe(true)
    })
    it('should return "false" if given route name is not "files-shared-with-me"', () => {
      expect(isSharedWithMeRoute({ name: 'files-personal' })).toBe(false)
    })
  })

  describe('isSharedWithOthersRoute', () => {
    it('should return "true" if given route name is "files-shared-with-others"', () => {
      expect(isSharedWithOthersRoute({ name: 'files-shared-with-others' })).toBe(true)
    })
    it('should return "false" if given route name is not "files-shared-with-others"', () => {
      expect(isSharedWithOthersRoute({ name: 'files-shared-with-me' })).toBe(false)
    })
  })

  describe('isAnySharedWithRoute', () => {
    it('should return "false" if given route is not "SharedWithMe" and "SharedWithOthers"', () => {
      expect(isAnySharedWithRoute({ name: 'files-personal' })).toBe(false)
    })
    it('should return "true" if given route is "SharedWithMe"', () => {
      expect(isAnySharedWithRoute({ name: 'files-shared-with-me' })).toBe(true)
    })
    it('should return "true" if given route is "SharedWithOthers"', () => {
      expect(isAnySharedWithRoute({ name: 'files-shared-with-others' })).toBe(true)
    })
  })

  describe('isPublicFilesRoute', () => {
    it('should return "true" if given route name is "files-public-list"', () => {
      expect(isPublicFilesRoute({ name: 'files-public-list' })).toBe(true)
    })
    it('should return "false" if given route name is not "files-public-list"', () => {
      expect(isPublicFilesRoute({ name: 'files-shared-with-others' })).toBe(false)
    })
  })

  describe('isPublicPage', () => {
    it('should return "false" if given route has no meta information', () => {
      expect(isPublicPage({ name: 'files-public-list' })).toBe(false)
    })
    it('should return "false" if given route meta auth is "true"', () => {
      expect(isPublicPage({ meta: { auth: true } })).toBe(false)
    })
    it('should return "true" if given route meta auth is "false"', () => {
      expect(isPublicPage({ meta: { auth: false } })).toBe(true)
    })
  })
})
