export const runtimeModuleMockOptions = {
  runtime: {
    namespaced: true,
    modules: {
      ancestorMetaData: {
        namespaced: true,
        getters: {
          ancestorMetaData: jest.fn(() => ({}))
        }
      },
      auth: {
        namespaced: true,
        getters: {
          isPublicLinkContextReady: jest.fn(() => true),
          isUserContextReady: jest.fn(() => true),
          accessToken: jest.fn(() => '')
        },
        mutations: {
          SET_PUBLIC_LINK_CONTEXT: jest.fn()
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
          UPSERT_SPACE: jest.fn(),
          SET_CURRENT_SPACE: jest.fn()
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
