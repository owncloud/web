import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { unref } from 'vue'

export default {
  computed: {
    _deletedFiles_base() {
      return {
        name: 'deletedFiles',
        icon: 'delete-bin-5',
        label: () => {
          return this.$gettext('Deleted files')
        },
        handler: this.$_deletedFiles_trigger,
        componentType: 'button',
        class: 'oc-files-actions-delete-trigger'
      }
    },
    $_deletedFiles_items() {
      return [
        {
          ...this._deletedFiles_base,
          isEnabled: this._deletedFiles_enabled_spaces,
        }
      ]
    },
    $_deletedFiles_items_generic() {
      return [
        {
          ...this._deletedFiles_base,
          isEnabled: this._deletedFiles_enabled_generic,
        }
      ]
    }
  },
  methods: {
    $_deletedFiles_trigger() {
      return this.$router.push({
        name: 'files-trash-generic',
        ...createFileRouteOptions(this.space, {
          path: unref(this.$router.currentRoute)
            ?.path?.split('/')
            .filter(Boolean)
            .slice(2)
            .join('/')
        })
      })
    },
    _deletedFiles_enabled_generic({ resources }) {

      if (resources.length !== 1) {
        return false
      }

      if (unref(this.$router.currentRoute).name !== 'files-spaces-generic') {
        return false
      }
      const elems = (resources[0].driveAlias || resources[0].path || '').split('/').filter(Boolean) //"/eos/project/c/cernbox"
      if (elems.length !== 4 || elems[1] !== 'project') {
        return false
      }

      return true
    },
    _deletedFiles_enabled_spaces({ resources }) {
      return resources.length === 1
    }
  }
}
