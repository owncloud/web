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
      }
    }
  }
}
