export * from './router'
export * from './store'
export * from './defaults'
export * from './fileListHeaderPosition'
export * from './pagination'
export * from './sort'

declare module 'vue/types/vue' {
  interface Vue {
    [key: string]: any
  }
}
