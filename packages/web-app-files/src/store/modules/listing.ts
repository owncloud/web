/**
 * problem statement:
 * our `files` array in the vuex store of the files app is only capable of representing one state.
 * multiple PROPFINDs for different folders, fired at similar times, will override each other in that state.
 * the longest running propfind wins. Cancelling the requests is not solving all edge cases, as the
 * PROPFINDs might finish at similar times so that cancellation is not happening anymore.
 *
 * idea for a solution:
 * loading resources in the different views should be converted into a two step process, each:
 * 1) set the activeView and activePath immediately after each navigation (SET_ACTIVE_VIEW, SET_ACTIVE_PATH)
 * 2) do the PROPFIND, convert the response into resources, and set them in a dedicated folder store module.
 *    That store module needs to get registered dynamically. The PROPFIND and conversion might be long running.
 *    It's really important that the activePath is set as early as possible!
 *
 * the views then render the files of the store module that matches the current `activePath`.
 * as a bonus, requests could be cancelled so that we avoid unnecessary store module creation.
 *
 * reasons for dynamically registered store modules: we need the reactivity of the individual files.
 * Which comes built in with the store modules. Another approach would be to build a cache of recent
 * propfind results (= response converted into a file listing). but that's not reactive by default.
 *
 * TODO: think about when to unregister the folder store modules. they might be big so removal should be happening as soon as not needed anymore.
 * TODO: further think about different views: propfind, fetch incoming shares, fetch outgoing shares, trashbin
 * TODO: the different `loadResources` methods from the views should live in a service, which then also takes care of creating the respective store module.
 */
import { GetterTree, MutationTree } from 'vuex'
import crypto from 'crypto'
import { Resource } from '../../types/resource'
import { RuntimeError } from 'web-runtime/src/container/error'

export const state = {
  activeView: null,
  activePath: null
}
export type State = typeof state

export enum MutationType {
  SET_ACTIVE_VIEW_AND_PATH = 'SET_ACTIVE_VIEW_AND_PATH'
}
export type Mutations<State> = {
  [MutationType.SET_ACTIVE_VIEW_AND_PATH](
    state: State,
    params: {
      activeView: string
      activePath: string
    }
  ): void
}
export const mutations: MutationTree<State> & Mutations<State> = {
  [MutationType.SET_ACTIVE_VIEW_AND_PATH](
    state: State,
    params: {
      activeView: string
      activePath: string
    }
  ) {
    state.activeView = params.activeView
    state.activePath = params.activePath
  }
}

export type Getters = {
  isLoading(state: State, getters: Getters, rootState: any): boolean
  getCurrentFolder(state: State, getters: Getters, rootState: any, rootGetters: any): Resource
  getFiles(state: State, getters: Getters, rootState: any, rootGetters: any): Resource[]
}

export const getters: GetterTree<State, State> & Getters = {
  isLoading(state, getters, rootState): boolean {
    const identifier = buildStoreModuleIdentifier(state.activeView, state.activePath)
    if (!hasStoreModule(state.activeView, state.activePath, rootState)) {
      return false
    }
    return rootState[`Files/${identifier}/loading`]
  },
  getCurrentFolder(state, getters, rootState, rootGetters): Resource {
    const identifier = buildStoreModuleIdentifier(state.activeView, state.activePath)
    if (!hasStoreModule(state.activeView, state.activePath, rootState)) {
      throw new RuntimeError('unknown resource')
    }
    return rootGetters[`Files/${identifier}/parent`]
  },
  getFiles(state, getters, rootState, rootGetters): Resource[] {
    const identifier = buildStoreModuleIdentifier(state.activeView, state.activePath)
    if (!hasStoreModule(state.activeView, state.activePath, rootState)) {
      throw new RuntimeError('unknown resource')
    }
    return rootGetters[`Files/${identifier}/children`]
  }
}

export const buildStoreModuleIdentifier = (activeView: string, activePath: string): string => {
  const hash = crypto.createHash('sha256')
  hash.update(activePath)
  return `${activeView}_${hash.digest().toString('hex')}`
}

const hasStoreModule = (activeView: string, activePath: string, rootState: any): boolean => {
  const identifier = buildStoreModuleIdentifier(activeView, activePath)
  return !!rootState[`Files/${identifier}`]
}

export default {
  namespaced: true,
  state: () => state,
  getters,
  mutations
}
