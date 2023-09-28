import DesignSystem from 'design-system'
import { createGettext } from 'vue3-gettext'
import { h } from 'vue'
import { abilitiesPlugin } from '@casl/vue'
import { createMongoAbility } from '@casl/ability'
import { AbilityRule } from '@ownclouders/web-client/src/helpers/resource/types'
import { createPinia } from 'pinia'

export interface DefaultPluginsOptions {
  abilities?: AbilityRule[]
  designSystem?: boolean
  gettext?: boolean
  pinia?: boolean
}

export const defaultPlugins = ({
  abilities = [],
  designSystem = true,
  gettext = true,
  pinia = true
}: DefaultPluginsOptions = {}) => {
  const plugins = []

  plugins.push({
    install(app) {
      app.use(abilitiesPlugin, createMongoAbility(abilities))
    }
  })

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

  if (pinia) {
    const pinia = createPinia()
    plugins.push(pinia)
  }

  plugins.push({
    install(app) {
      app.component('RouterLink', {
        name: 'RouterLink',
        props: {
          tag: { type: String, default: 'a' },
          to: { type: [String, Object], default: '' }
        },
        render() {
          let path = this.$props.to

          if (!!path && typeof path !== 'string') {
            path = this.$props.to.path || this.$props.to.name

            if (this.$props.to.params) {
              path += '/' + Object.values(this.$props.to.params).join('/')
            }

            if (this.$props.to.query) {
              path += '?' + Object.values(this.$props.to.query).join('&')
            }
          }

          return h(this.tag, { attrs: { href: path } }, this.$slots.default)
        }
      })
    }
  })

  return plugins
}
