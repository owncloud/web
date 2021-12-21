declare module 'vue/types/web' {
  interface Vue {
    [key: string]: any
  }
}

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
