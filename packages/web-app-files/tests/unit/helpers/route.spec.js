describe('route', () => {
  describe('checkRoute', () => {
    it.todo('should return "true" if given "routes" array contains given "currentRoute"')
    it.todo('should return "false" if given "routes" array does not contains given "currentRoute"')
  })

  describe('isPersonalRoute', () => {
    it.todo('should return "true" if given route name is "files-personal"')
    it.todo('should return "false" if given route name is not "files-personal"')
  })

  describe('isFavoritesRoute', () => {
    it.todo('should return "true" if given route name is "files-favorites"')
    it.todo('should return "false" if given route name is not "files-favorites"')
  })

  describe('isTrashbinRoute', () => {
    it.todo('should return "true" if given route name is "files-trashbin"')
    it.todo('should return "false" if given route name is not "files-trashbin"')
  })

  describe('isSharedWithMeRoute', () => {
    it.todo('should return "true" if given route name is "files-shared-with-me"')
    it.todo('should return "false" if given route name is not "files-shared-with-me"')
  })

  describe('isSharedWithOthersRoute', () => {
    it.todo('should return "true" if given route name is "files-shared-with-others"')
    it.todo('should return "false" if given route name is not "files-shared-with-others"')
  })

  describe('isAnySharedWithRoute', () => {
    it.todo('should return "false" if given route is not "SharedWithMe" and "SharedWithOthers"')
    it.todo('should return "true" if given route is "SharedWithMe"')
    it.todo('should return "true" if given route is "SharedWithOthers"')
  })

  describe('isPublicFilesRoute', () => {
    it.todo('should return "true" if given route name is "files-public-list"')
    it.todo('should return "false" if given route name is not "files-public-list"')
  })

  describe('isPublicPage', () => {
    it.todo('should return "false" if given route has no meta information')
    it.todo('should return "false" if given route meta auth is "true"')
    it.todo('should return "true" if given route meta auth is "false"')
  })
})
