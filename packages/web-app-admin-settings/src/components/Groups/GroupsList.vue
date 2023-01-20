<template>
  <div>
    <oc-text-input
      id="groups-filter"
      v-model="filterTerm"
      class="oc-ml-m oc-my-s"
      :label="$gettext('Filter groups')"
      autocomplete="off"
    />
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
          @click="showDetails(item)"
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
          <p class="oc-text-muted">{{ footerTextTotal }}</p>
          <p v-if="filterTerm" class="oc-text-muted">{{ footerTextFilter }}</p>
        </div>
      </template>
    </oc-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Fuse from 'fuse.js'
import Mark from 'mark.js'
import { eventBus } from 'web-pkg'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

export default defineComponent({
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
  emits: ['toggleSelectAllGroups', 'unSelectAllGroups', 'toggleSelectGroup'],
  setup(props, { emit }) {
    const showDetails = (group) => {
      emit('unSelectAllGroups')
      emit('toggleSelectGroup', group)
      eventBus.publish(SideBarEventTopics.open)
    }

    return { showDetails }
  },
  data() {
    return {
      sortBy: 'displayName',
      sortDir: 'asc',
      markInstance: null,
      filterTerm: ''
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
    footerTextTotal() {
      const translated = this.$gettext('%{groupCount} groups in total')
      return this.$gettextInterpolate(translated, { groupCount: this.groups.length })
    },
    footerTextFilter() {
      const translated = this.$gettext('%{groupCount} matching groups')
      return this.$gettextInterpolate(translated, { groupCount: this.data.length })
    },
    data() {
      const orderedGroups = this.orderBy(this.groups, this.sortBy, this.sortDir === 'desc')
      return this.filter(orderedGroups, this.filterTerm)
    },
    highlighted() {
      return this.selectedGroups.map((group) => group.id)
    }
  },
  watch: {
    filterTerm() {
      if (!this.markInstance) {
        return
      }
      this.markInstance.unmark()
      this.markInstance.mark(this.filterTerm, {
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
    filter(groups, filterTerm) {
      if (!(filterTerm || '').trim()) {
        return groups
      }
      const groupsSearchEngine = new Fuse(groups, {
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
        keys: ['displayName']
      })

      return groupsSearchEngine.search(filterTerm).map((r) => r.item)
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
})
</script>

<style lang="scss">
#groups-filter {
  width: 16rem;
}

.highlight-mark {
  font-weight: 600;
}
</style>
