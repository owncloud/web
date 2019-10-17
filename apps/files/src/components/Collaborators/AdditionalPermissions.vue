<template>
  <oc-grid gutter="small">
    <label v-for="permission in permissions" :key="permission.name">
      <oc-checkbox
        class="uk-margin-xsmall-right"
        v-model="permission.value"
        @change="permissionChecked"
      />
      {{ permission.description }}
    </label>
  </oc-grid>
</template>

<script>
import filterObject from 'filter-obj'

export default {
  name: 'AdditionalPermissions',
  props: {
    /**
     * Available permissions for the role
     */
    availablePermissions: {
      type: Object,
      required: true
    },
    /**
     * Additional permissions of the collaborator with values
     */
    collaboratorsPermissions: {
      type: Object,
      required: false
    }
  },
  computed: {
    permissions () {
      const permissions = this.availablePermissions

      for (const permission in permissions) {
        if (this.collaboratorsPermissions && this.collaboratorsPermissions[permission]) {
          permissions[permission].value = true
          continue
        }

        permissions[permission].value = false
      }

      return permissions
    }
  },
  methods: {
    permissionChecked () {
      const selectedPermissions = []
      const permissions = filterObject(this.permissions, (key, value) => {
        return value.value === true
      })

      for (const permission in permissions) {
        selectedPermissions.push(permission)
      }

      this.$emit('permissionChecked', selectedPermissions)
    }
  }
}
</script>
