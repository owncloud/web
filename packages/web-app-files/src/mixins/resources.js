import filesize from 'filesize'

export default {
  methods: {
    /**
     * Returns formatted size of given resource
     * @param {Number} size Unformatted size of the resource
     * @returns {String} formatted size
     */
    getResourceSize(size) {
      if (size < 0) {
        return ''
      }

      if (isNaN(size)) {
        return '?'
      }

      const mb = 1048576

      // TODO: Pass current language as locale to display correct separator
      return filesize(size, {
        round: size < mb ? 0 : 1
      })
    }
  }
}
