import sidebarModule from '../../../../src/store/modules/sidebar.js'
import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)

describe('sidebar store module', () => {
  let store
  beforeEach(() => {
    store = new Vuex.Store({
      state: sidebarModule.state(),
      mutations: sidebarModule.mutations,
      actions: sidebarModule.actions
    })
  })
  describe('opening the sidebar', () => {
    it('sets closed to false', async () => {
      expect(store.state.closed).toBe(true)
      await store.dispatch(sidebarModule.actions.open.name)
      expect(store.state.closed).toBe(false)
    })
    describe('without a panel name', () => {
      it('resets the active panel', async () => {
        store.state.activePanel = 'test'
        await store.dispatch(sidebarModule.actions.open.name)
        expect(store.state.activePanel).toBeNull()
      })
    })
    describe('with a panel name', () => {
      it('sets the given panel as active panel', async () => {
        expect(store.state.activePanel).toBeNull()
        await store.dispatch(sidebarModule.actions.openWithPanel.name, 'test')
        expect(store.state.activePanel).toBe('test')
      })
    })
  })
  describe('closing the sidebar', () => {
    it('sets closed to true', async () => {
      store.state.closed = false
      await store.dispatch(sidebarModule.actions.close.name)
      expect(store.state.closed).toBe(true)
    })
    it('resets the active panel', async () => {
      store.state.activePanel = 'test'
      await store.dispatch(sidebarModule.actions.close.name)
      expect(store.state.activePanel).toBeNull()
    })
  })
  describe('toggling the sidebar', () => {
    it('sets closed to false when opening', async () => {
      store.state.closed = true
      await store.dispatch(sidebarModule.actions.toggle.name)
      expect(store.state.closed).toBe(false)
    })
    it('sets closed to true when closing', async () => {
      store.state.closed = false
      await store.dispatch(sidebarModule.actions.toggle.name)
      expect(store.state.closed).toBe(true)
    })
    it('does not change the active panel', async () => {
      store.state.activePanel = 'test'
      await store.dispatch(sidebarModule.actions.toggle.name)
      expect(store.state.activePanel).toBe('test')
      await store.dispatch(sidebarModule.actions.toggle.name)
      expect(store.state.activePanel).toBe('test')
    })
  })
  it('sets the active panel', async () => {
    expect(store.state.activePanel).toBeNull()
    await store.dispatch(sidebarModule.actions.setActivePanel.name, 'test')
    expect(store.state.activePanel).toBe('test')
  })
  it('resets the active panel', async () => {
    store.state.activePanel = 'test'
    await store.dispatch(sidebarModule.actions.resetActivePanel.name)
    expect(store.state.activePanel).toBeNull()
  })
})
