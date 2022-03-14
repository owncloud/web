export * from './fileListHeaderPosition'
export * from './pagination'
export * from './resourcesViewDefaults'
export * from './router'
export * from './sort'

declare module 'vue/types/vue' {
  interface Vue {
    [key: string]: any
  }
}
