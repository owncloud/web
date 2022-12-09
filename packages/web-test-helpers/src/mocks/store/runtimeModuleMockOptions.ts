export const runtimeModuleMockOptions = {
  runtime: {
    namespaced: true,
    modules: {
      spaces: {
        namespaced: true,
        getters: {
          spaces: jest.fn(() => [])
        },
        mutations: {
          UPDATE_SPACE_FIELD: jest.fn()
        },
        actions: {
          loadSpaceMembers: jest.fn(),
          reloadProjectSpaces: jest.fn()
        }
      }
    }
  }
}
