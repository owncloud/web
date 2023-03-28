import DesignSystem from 'design-system'
import { createGettext } from 'vue3-gettext'
import { h } from 'vue'
import { abilitiesPlugin } from '@casl/vue'
import { createMongoAbility } from '@casl/ability'
import { AbilityRule } from 'web-pkg/src'

export interface DefaultPluginsOptions {
  designSystem?: boolean
  gettext?: boolean
  abilities?: AbilityRule[]
}

export const defaultPlugins = ({
  designSystem = true,
  gettext = true,
  abilities = []
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

  plugins.push({
    install(app) {
      app.use(abilitiesPlugin, createMongoAbility(abilities))
    }
  })

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
