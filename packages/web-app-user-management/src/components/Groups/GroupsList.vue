<template>
  <div>
    <oc-table-simple id="group-list" class="oc-mt-l">
      <oc-thead>
        <oc-tr>
          <oc-th shrink type="head" align-h="center">
            <oc-checkbox
              class="oc-ml-s"
              :value="true"
              :label="$gettext('Select all groups')"
              hide-label
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
        />
      </oc-tbody>
    </oc-table-simple>
  </div>
</template>

<script>
import GroupsListRow from './GroupsListRow.vue'

export default {
  name: 'GroupsList',
  components: { GroupsListRow },
  props: {
    groups: {
      type: Array,
      required: true
    }
  }
}
</script>
