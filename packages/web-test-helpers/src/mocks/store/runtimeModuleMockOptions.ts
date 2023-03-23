export const runtimeModuleMockOptions = {
  runtime: {
    namespaced: true,
    modules: {
      auth: {
        namespaced: true,
        getters: {
          isPublicLinkContextReady: jest.fn(() => true),
          isUserContextReady: jest.fn(() => true),
          accessToken: jest.fn(() => '')
        }
      },
      spaces: {
        namespaced: true,
        getters: {
          spaces: jest.fn(() => []),
          spaceMembers: jest.fn(() => [])
        },
        mutations: {
          UPDATE_SPACE_FIELD: jest.fn(),
          REMOVE_SPACE: jest.fn(),
          UPSERT_SPACE: jest.fn()
        },
        actions: {
          loadSpaceMembers: jest.fn(),
          changeSpaceMember: jest.fn(),
          deleteSpaceMember: jest.fn(),
          addSpaceMember: jest.fn(),
          reloadProjectSpaces: jest.fn()
        }
      }
    }
  }
}
