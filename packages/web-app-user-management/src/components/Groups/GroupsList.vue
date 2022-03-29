<template>
  <oc-table
    :sort-by="sortBy"
    :sort-dir="sortDir"
    :fields="fields"
    :data="data"
    :highlighted="highlighted"
    @sort="handleSort"
  >
    <template #selectHeader>
      <oc-checkbox
        size="large"
        class="oc-ml-s"
        :label="$gettext('Select all groups')"
        :value="allGroupsSelected"
        hide-label
        @input="$emit('toggleSelectAllGroups')"
      />
    </template>
    <template #select="rowData">
      <oc-checkbox
        class="oc-ml-s"
        size="large"
        :value="selectedGroups"
        :option="rowData.item"
        :label="getSelectGroupLabel(rowData.item)"
        hide-label
        @input="$emit('toggleSelectGroup', rowData.item)"
      />
    </template>
    <template #avatar="rowData">
      <avatar-image :width="32" :userid="rowData.item.id" :user-name="rowData.item.displayName" />
    </template>
    <template #footer>
      <div class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s">
        <p class="oc-text-muted">{{ footerText }}</p>
      </div>
    </template>
  </oc-table>
</template>

<script>
const orderBy = (list, prop, desc) => {
  return [...list].sort((a, b) => {
    a = a[prop]
    b = b[prop]
    return desc ? b.localeCompare(a) : a.localeCompare(b)
  })
}

export default {
  name: 'GroupsList',
  props: {
    groups: {
      type: Array,
      required: true
    },
    selectedGroups: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      sortBy: 'displayName',
      sortDir: 'asc'
    }
  },
  computed: {
    fields() {
      return [
        {
          name: 'select',
          title: '',
          type: 'slot',
          width: 'shrink',
          headerType: 'slot'
        },
        {
          name: 'avatar',
          title: '',
          type: 'slot',
          width: 'shrink'
        },
        {
          name: 'displayName',
          title: this.$gettext('Group name'),
          sortable: true
        },
        {
          name: 'role',
          title: this.$gettext('Your role'),
          sortable: true
        },
        {
          name: 'members',
          title: this.$gettext('Members'),
          sortable: true
        }
      ]
    },
    allGroupsSelected() {
      return this.groups.length === this.selectedGroups.length
    },
    footerText() {
      const translated = this.$gettext('%{groupCount} groups in total')
      return this.$gettextInterpolate(translated, { groupCount: this.groups.length })
    },
    data() {
      return orderBy([...this.groups], this.sortBy, this.sortDir === 'desc')
    },
    highlighted() {
      return this.selectedGroups.map((group) => group.id)
    }
  },
  methods: {
    handleSort(event) {
      this.sortBy = event.sortBy
      this.sortDir = event.sortDir
    },
    getSelectGroupLabel(group) {
      const translated = this.$gettext('Select %{ group }')
      return this.$gettextInterpolate(translated, { group: group.displayName }, true)
    }
  }
}
</script>
