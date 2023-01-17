import DesignSystem from '@ownclouders/design-system'
import Vue from 'vue'
import { createGettext } from 'vue3-gettext'
;(window as any).Vue = Vue

export interface DefaultPluginsOptions {
  designSystem?: boolean
  gettext?: boolean
}

export const defaultPlugins = ({
  designSystem = true,
  gettext = true
}: DefaultPluginsOptions = {}) => {
  const plugins = []

  if (designSystem) {
    plugins.push(DesignSystem)
  }

  if (gettext) {
    plugins.push(createGettext({ translations: {}, silent: true }))
  } else {
    plugins.push({
      install(app) {
        // mock `v-translate` directive
        app.directive('translate', {
          inserted: () => undefined
        })
      }
    })
  }

  return plugins
}
