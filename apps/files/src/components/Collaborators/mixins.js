export default {
  methods: {
    $_ocCollaborators_collaboratorType (type) {
      if (type === '0' || type === 0) return this.$gettext('User')

      return this.$gettext('Group')
    },
    $_ocCollaborators_switchPermission (permission) {
      this[permission] = !this[permission]
      this.editing = true
    }
  }
}
