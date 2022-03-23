<template>
  <div>
    <oc-table-simple id="group-list" class="oc-mt-l">
      <oc-thead>
        <oc-tr>
          <oc-th shrink type="head" align-h="center">
            <oc-checkbox
              size="large"
              class="oc-ml-s"
              :label="$gettext('Select all groups')"
              :value="allGroupsSelected"
              hide-label
              @input="toggleSelectAllGroups"
            />
          </oc-th>
          <oc-th shrink type="head" />
          <oc-th type="head" v-text="$gettext('Group name')" />
          <oc-th type="head" v-text="$gettext('Your role')" />
          <oc-th type="head" v-text="$gettext('Members')" />
        </oc-tr>
      </oc-thead>
      <oc-tbody>
        <groups-list-row
          v-for="group in groups"
          :key="`group-list-row-${group.id}`"
          :group="group"
          :selected-groups="selectedGroups"
        />
      </oc-tbody>
    </oc-table-simple>
  </div>
</template>

<script>
import GroupsListRow from './GroupsListRow.vue'
import { bus } from 'web-pkg/src/instance'

export default {
  name: 'GroupsList',
  components: { GroupsListRow },
  props: {
    groups: {
      type: Array,
      required: true
    }
  },
  data: function () {
    return {
      selectedGroups: []
    }
  },
  computed: {
    allGroupsSelected() {
      return this.groups.length === this.selectedGroups.length
    }
  },
  mounted() {
    const loadResourcesEventToken = bus.subscribe('app.user-management.groups.toggle', (group) =>
      this.toggleSelectedGroup(group)
    )

    this.$on('beforeDestroy', () => {
      bus.unsubscribe('app.user-management.groups.toggle', loadResourcesEventToken)
    })
  },
  methods: {
    toggleSelectAllGroups() {
      if (this.allGroupsSelected) {
        return (this.selectedGroups = [])
      }
      this.selectedGroups = [...this.groups]
    },

    toggleSelectedGroup(toggledGroup) {
      const isGroupSelected = this.selectedGroups.find((group) => group.id === toggledGroup.id)

      if (!isGroupSelected) {
        return this.selectedGroups.push(toggledGroup)
      }

      this.selectedGroups = this.selectedGroups.filter((group) => group.id !== toggledGroup.id)
    }
  }
}
</script>
