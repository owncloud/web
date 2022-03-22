<template>
  <oc-tr>
    <oc-td align-h="center">
      <oc-checkbox class="oc-ml-s" size="large" />
    </oc-td>
    <oc-td>
      <avatar-image :width="32" :userid="group.id" :user-name="group.displayName" />
    </oc-td>
    <oc-td v-text="group.displayName || '-'" />
    <oc-td></oc-td>
    <oc-td></oc-td>
  </oc-tr>
</template>

<script>
export default {
  name: 'GroupListRow',

  props: {
    group: {
      type: Object,
      required: true
    }
  }
}
</script>
