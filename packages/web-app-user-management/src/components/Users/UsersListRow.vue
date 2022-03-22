<template>
  <oc-tr>
    <oc-td align-h="center">
      <oc-checkbox class="oc-ml-s" size="large" />
    </oc-td>
    <oc-td>
      <avatar-image :width="32" :userid="user.id" :user-name="user.displayName" />
    </oc-td>
    <oc-td v-text="user.onPremisesSamAccountName" />
    <oc-td v-text="user.displayName || '-'" />
    <oc-td v-text="user.mail" />
    <oc-td></oc-td>
    <oc-td></oc-td>
  </oc-tr>
</template>

<script>
export default {
  name: 'UserListRow',

  props: {
    user: {
      type: Object,
      required: true
    }
  }
}
</script>
