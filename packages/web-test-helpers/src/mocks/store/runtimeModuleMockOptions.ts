export const runtimeModuleMockOptions = {
  runtime: {
    namespaced: true,
    modules: {
      spaces: {
        namespaced: true,
        getters: {
          spaces: jest.fn(() => [])
        },
        actions: {
          loadSpaceMembers: jest.fn(),
          reloadProjectSpaces: jest.fn()
        }
      }
    }
  }
}
