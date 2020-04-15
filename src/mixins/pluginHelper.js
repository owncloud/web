export default {
  methods: {
    /**
     * Path to application file
     *
     * @param exp Extensionpoint
     * @param plugin Plugin
     */

    getPlugin(ext) {
      return this.$root.plugins.find(n => {
        if (n.extend === ext) {
          return n
        }
      })
    },

    getPlugins(ext) {
      return this.$root.plugins.filter(n => {
        if (n.extend === ext) {
          return n
        }
      })
    }
  }
}
