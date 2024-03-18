<template>
  <div class="oc-mt-xl">
    <div v-if="noGroups" class="oc-flex group-info oc-text-center">
      <oc-icon name="group-2" size="xxlarge" />
      <p v-translate>Select a group to view details</p>
    </div>
    <div v-if="multipleGroups" class="oc-flex group-info">
      <oc-icon name="group-2" size="xxlarge" />
      <p>{{ multipleGroupsSelectedText }}</p>
    </div>
    <div v-if="group">
      <GroupInfoBox :group="group" />
      <table
        class="details-table"
        :aria-label="$gettext('Overview of the information about the selected group')"
      >
        <tr>
          <th scope="col" class="oc-pr-s" v-text="$gettext('Group name')" />
          <td v-text="group.displayName" />
        </tr>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import GroupInfoBox from './GroupInfoBox.vue'
import { Group } from '@ownclouders/web-client/src/generated'

export default defineComponent({
  name: 'DetailsPanel',
  components: { GroupInfoBox },
  props: {
    groups: {
      type: Array as PropType<Group[]>,
      required: true
    }
  },
  computed: {
    group() {
      return this.groups.length === 1 ? this.groups[0] : null
    },
    noGroups() {
      return !this.groups.length
    },
    multipleGroups() {
      return this.groups.length > 1
    },
    multipleGroupsSelectedText() {
      return this.$gettext('%{count} groups selected', {
        count: this.groups.length.toString()
      })
    }
  }
})
</script>
<style lang="scss">
.group-info {
  align-items: center;
  flex-direction: column;
}

.group-info-display-name {
  font-size: 1.5rem;
}

.details-table {
  text-align: left;

  tr {
    height: 1.5rem;
  }

  th {
    font-weight: 600;
  }
}
</style>
