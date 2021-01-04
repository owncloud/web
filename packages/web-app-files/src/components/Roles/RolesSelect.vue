<template>
  <div>
    <label class="oc-label">
      <translate>Role:</translate>
    </label>
    <oc-button
      :id="`files-${mode}-role-button`"
      justify-content="space-between"
      :class="`uk-width-1-1 files-${mode}-role-button`"
    >
      <role-item :show-description="false" :role="selectedRole" />
      <oc-icon name="expand_more" />
    </oc-button>
    <oc-drop
      close-on-click
      :drop-id="`files-${mode}-roles-dropdown`"
      :toggle="`#files-${mode}-role-button`"
      mode="click"
      position="bottom-justify"
      :options="{ offset: 0, delayHide: 0, flip: false }"
      class="oc-autocomplete-dropdown"
    >
      <ul class="oc-autocomplete-suggestion-list">
        <li
          v-for="role in roles"
          :id="`files-${mode}-role-${role.name}`"
          :key="role.name"
          class="oc-autocomplete-suggestion"
          :class="{ 'oc-autocomplete-suggestion-selected': role.name === selectedRole.name }"
          @click="selectRole(role)"
        >
          <role-item :role="role" />
        </li>
      </ul>
    </oc-drop>
  </div>
</template>

<script>
import RoleItem from './RoleItem.vue'

export default {
  name: 'RolesSelect',
  components: { RoleItem },
  props: {
    mode: {
      type: String,
      required: true,
      validator(value) {
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
    selectRole(role) {
      this.$emit('roleSelected', role)
    }
  }
}
</script>
