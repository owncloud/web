<template>
  <oc-table
    ref="table"
    :sort-by="sortBy"
    :sort-dir="sortDir"
    :fields="fields"
    :data="data"
    :highlighted="highlighted"
    :sticky="true"
    :header-position="headerPosition"
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
    <template #members="rowData">
      {{ rowData.item.members.length }}
    </template>
    <template #actions="{ item }">
      <oc-button
        v-oc-tooltip="$gettext('Details')"
        appearance="raw"
        class="oc-mr-xs quick-action-button oc-p-xs"
        @click="$emit('showPanel', { group: item, panel: 'DetailsPanel' })"
      >
        <oc-icon name="information" fill-type="line" />
      </oc-button>
      <!-- Editing groups is currently not supported by backend
      <oc-button v-oc-tooltip="$gettext('Edit')" class="oc-ml-s" @click="$emit('clickEdit', item)">
        <oc-icon size="small" name="pencil" />
      </oc-button>
      -->
    </template>
    <template #footer>
      <div class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s">
        <p class="oc-text-muted">{{ footerText }}</p>
      </div>
    </template>
  </oc-table>
</template>

<script>
import { onBeforeUnmount, ref } from '@vue/composition-api'
import { Registry } from '../../services'
import Fuse from 'fuse.js'
import Mark from 'mark.js'

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
    },
    headerPosition: {
      type: Number,
      required: true
    }
  },
  setup() {
    const searchTerm = ref('')
    const token = Registry.search.subscribe('updateTerm', ({ term }) => (searchTerm.value = term))
    onBeforeUnmount(() => Registry.search.unsubscribe('updateTerm', token))

    return {
      searchTerm
    }
  },
  data() {
    return {
      sortBy: 'displayName',
      sortDir: 'asc',
      markInstance: null
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
          name: 'members',
          title: this.$gettext('Members'),
          type: 'slot',
          sortable: true
        },
        {
          name: 'actions',
          title: this.$gettext('Actions'),
          sortable: false,
          type: 'slot',
          alignH: 'right'
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
      const orderedGroups = this.orderBy(this.groups, this.sortBy, this.sortDir === 'desc')
      return this.filter(orderedGroups, this.searchTerm)
    },
    highlighted() {
      return this.selectedGroups.map((group) => group.id)
    }
  },
  watch: {
    searchTerm() {
      if (!this.markInstance) {
        return
      }
      this.markInstance.unmark()
      this.markInstance.mark(this.searchTerm, {
        element: 'span',
        className: 'highlight-mark',
        exclude: ['th *', 'tfoot *']
      })
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.markInstance = new Mark(this.$refs.table.$el)
    })
  },
  methods: {
    filter(groups, searchTerm) {
      if (!(searchTerm || '').trim()) {
        return groups
      }
      const groupsSearchEngine = new Fuse(groups, {
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
        keys: ['displayName']
      })

      return groupsSearchEngine.search(searchTerm).map((r) => r.item)
    },
    orderBy(list, prop, desc) {
      return [...list].sort((a, b) => {
        a = a[prop] || ''
        b = b[prop] || ''
        return desc ? b.localeCompare(a) : a.localeCompare(b)
      })
    },
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

<style lang="scss">
.highlight-mark {
  font-weight: 600;
}
</style>
