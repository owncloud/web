import { Component, defineComponent, h } from 'vue'
import ComponentLoaderWrapper from './ComponentLoaderWrapper.vue'

export type LoadComponent = () => Promise<Component>

export function ComponentLoader(loadComponent: LoadComponent) {
  return defineComponent({
    render() {
      return h(ComponentLoaderWrapper, { loadComponent })
    }
  })
}
