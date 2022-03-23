<template>
  <oc-tr>
    <oc-td align-h="center">
      <oc-checkbox
        class="oc-ml-s"
        size="large"
        :value="selectedGroups"
        :option="group"
        :label="selectGroupLabel"
        hide-label
        @input="toggleSelectedGroup"
      />
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
import { bus } from 'web-pkg/src/instance'

export default {
  name: 'GroupListRow',

  props: {
    group: {
      type: Object,
      required: true
    },
    selectedGroups: {
      type: Array,
      required: true
    }
  },
  computed: {
    selectGroupLabel() {
      const translated = this.$gettext('Select %{ group }')

      return this.$gettextInterpolate(translated, { group: this.group.displayName }, true)
    }
  },
  methods: {
    toggleSelectedGroup() {
      bus.publish('app.user-management.groups.toggle', this.group)
    }
  }
}
</script>
