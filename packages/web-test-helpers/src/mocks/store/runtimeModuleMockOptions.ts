export const runtimeModuleMockOptions = {
  runtime: {
    namespaced: true,
    modules: {
      ancestorMetaData: {
        namespaced: true,
        getters: {
          ancestorMetaData: jest.fn(() => ({}))
        }
      }
    }
  }
}
