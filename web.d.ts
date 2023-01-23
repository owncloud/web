/// <reference types="vite/client" />

declare module 'vue' {
  export * from '@vue/runtime-dom'
  const { configureCompat } = Vue
  export { configureCompat }

  export interface GlobalComponents {
    Portal: typeof import('portal-vue')['Portal']
    PortalTarget: typeof import('portal-vue')['PortalTarget']

    RouterLink: typeof import('vue-router')['RouterLink']
    RouterView: typeof import('vue-router')['RouterView']
  }
}
declare module '*.vue' {
  import { defineComponent } from 'vue'
  const component: ReturnType<typeof defineComponent>
  export default component
}
