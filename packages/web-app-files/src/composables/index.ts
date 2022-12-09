export * from './fileListHeaderPosition'
export * from './pagination'
export * from './resourcesViewDefaults'
export * from './router'
export * from './selection'
export * from './sort'
export * from './viewMode'

declare module 'vue/types/vue' {
  interface Vue {
    [key: string]: any
  }
}
