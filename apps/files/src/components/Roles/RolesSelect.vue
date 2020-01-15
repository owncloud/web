<template>
  <div>
    <label class="oc-label">
      <translate>Role</translate>:
    </label>
    <oc-button
      :id="`files-${mode}-role-button`"
      :class="`uk-width-1-1 files-${mode}-role-button`"
      v-text="selectedRole.label"
    />
    <oc-drop
      closeOnClick
      :dropId="`files-${mode}-roles-dropdown`"
      :toggle="`#files-${mode}-role-button`"
      mode="click"
      :options="{ offset: 0, delayHide: 0 }"
      class="oc-autocomplete-dropdown"
    >
      <ul class="oc-autocomplete-suggestion-list">
        <li
          v-for="role in roles"
          :key="role.name"
          :id="`files-${mode}-role-${role.name}`"
          class="oc-autocomplete-suggestion"
          :class="{ 'oc-autocomplete-suggestion-selected': role.name === selectedRole.name }"
          @click="selectRole(role)"
        >
          <span class="uk-text-bold" v-text="role.label" />
          <p
            class="uk-text-meta uk-margin-remove"
            v-text="role.description"
          />
        </li>
      </ul>
    </oc-drop>
  </div>
</template>

<script>
export default {
  name: 'RolesSelect',
  props: {
    mode: {
      type: String,
      required: true,
      validator (value) {
        return ['collaborators', 'file-link'].indexOf(value) !== -1
      }
    },
    roles: {
      type: Object,
      required: true
    },
    selectedRole: {
      type: Object,
      required: true
    }
  },
  methods: {
    selectRole (role) {
      this.$emit('roleSelected', role)
    }
  }
}
</script>
