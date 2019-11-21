<template>
  <div>
    <label class="oc-label">
      <translate>Role</translate>:
    </label>
    <oc-button
      id="files-collaborators-role-button"
      class="uk-width-1-1 files-collaborators-role-button"
      v-text="selectedRole.label"
    />
    <oc-drop
      closeOnClick
      dropId="files-collaborators-roles-dropdown"
      toggle="#files-collaborators-role-button"
      mode="click"
      :options="{ offset: 0, delayHide: 0 }"
      class="oc-autocomplete-dropdown"
    >
      <ul class="oc-autocomplete-suggestion-list">
        <li
          v-for="role in roles"
          :key="role.name"
          :id="`files-collaborator-new-collaborator-role-${role.name}`"
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
import collaboratorsMixin from '../../mixins/collaborators'

export default {
  name: 'RolesSelect',
  mixins: [
    collaboratorsMixin
  ],
  props: {
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
