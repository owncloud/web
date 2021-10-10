import { MutationTree } from 'vuex'
import { Resource } from '../../types/resource'

export const state = {
  loading: true,
  path: '',
  parent: null,
  children: []
}
export type State = typeof state

export enum MutationType {
  SET_LOADING = 'SET_LOADING',
  SET_PATH = 'SET_PATH',
  SET_PARENT = 'SET_PARENT',
  SET_CHILDREN = 'SET_CHILDREN'
}

export type Mutations<State> = {
  [MutationType.SET_LOADING](state: State, loading: boolean): void
  [MutationType.SET_PATH](state: State, path: string): void
  [MutationType.SET_PARENT](state: State, parent: Resource): void
  [MutationType.SET_CHILDREN](state: State, children: Resource[]): void
}

export const mutations: MutationTree<State> & Mutations<State> = {
  [MutationType.SET_LOADING](state: State, loading: boolean): void {
    state.loading = loading
  },
  [MutationType.SET_PATH](state: State, path: string): void {
    state.path = path
  },
  [MutationType.SET_PARENT](state: State, parent: Resource): void {
    state.parent = parent
  },
  [MutationType.SET_CHILDREN](state: State, children: Resource[]): void {
    state.children = children
  }
}

export default {
  namespaced: true,
  state: () => state,
  mutations
}
