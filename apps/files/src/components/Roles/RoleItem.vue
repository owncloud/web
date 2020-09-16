<template>
  <div class="roles-select-role-item">
    <span class="uk-text-bold" v-text="role.label" />
    <p v-if="showDescription" class="uk-text-meta uk-margin-remove" v-text="role.description" />
  </div>
</template>

<script>
export default {
  name: 'RoleItem',
  props: {
    showDescription: {
      type: Boolean,
      default: true
    },
    role: {
      type: Object,
      required: true
    }
  }
}
</script>

<style>
/* FIXME: move into ODS? */
.roles-select-role-item {
  text-transform: none;
}
</style>
