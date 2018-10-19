const _find = require('lodash/find')
const _filter = require('lodash/filter')

export default {
  methods: {

    /**
     * Path to application file
     *
     * @param exp Extensionpoint
     * @param plugin Plugin
     */

    getPlugin (ext) {
      return _find(this.$root.plugins, ['extend', ext])
    },

    getPlugins (ext) {
      return _filter(this.$root.plugins, ['extend', ext])
    }
  }
}
