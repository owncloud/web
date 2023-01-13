<template>
  <div class="oc-ml-s">
    <oc-text-input
      v-model="filterTerm"
      class="oc-text-truncate oc-mr-s oc-mt-m"
      label=""
      :placeholder="$gettext('Filter members')"
    />
    <div ref="membersListRef">
      <div v-if="!filteredSpaceMembers.length">
        <h4 v-text="$gettext('No members found')" />
      </div>
      <div v-if="filteredSpaceManagers.length" class="oc-mb-m">
        <h4 v-translate>Managers</h4>
        <members-role-section :members="filteredSpaceManagers" />
      </div>
      <div v-if="filteredSpaceEditors.length" class="oc-mb-m">
        <h4 v-translate>Editors</h4>
        <members-role-section :members="filteredSpaceEditors" />
      </div>
      <div v-if="filteredSpaceViewers.length" class="oc-mb-m">
        <h4 v-translate>Viewers</h4>
        <members-role-section :members="filteredSpaceViewers" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, watch } from 'vue'
import { SpaceResource } from 'web-client/src'
import MembersRoleSection from './MembersRoleSection.vue'
import { ref, unref } from 'vue-demi'
import Fuse from 'fuse.js'
import Mark from 'mark.js'

export default defineComponent({
  name: 'MembersPanel',
  components: { MembersRoleSection },
  props: {
    spaceResource: {
      type: Object as PropType<SpaceResource>,
      required: true
    }
  },
  setup(props) {
    const filterTerm = ref('')
    const markInstance = ref(null)
    const membersListRef = ref(null)
    const filterMembers = (collection, term) => {
      if (!(term || '').trim()) {
        return collection
      }

      const searchEngine = new Fuse(collection, {
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
        keys: ['displayName']
      })

      return searchEngine.search(term).map((r) => r.item)
    }

    const spaceMembers = computed(() => {
      return [
        ...props.spaceResource.spaceRoles.manager.map((r) => ({ ...r, roleType: 'manager' })),
        ...props.spaceResource.spaceRoles.editor.map((r) => ({ ...r, roleType: 'editor' })),
        ...props.spaceResource.spaceRoles.viewer.map((r) => ({ ...r, roleType: 'viewer' }))
      ].sort((a, b) => a.displayName.localeCompare(b.displayName))
    })

    const filteredSpaceMembers = computed(() => {
      return filterMembers(unref(spaceMembers), unref(filterTerm))
    })
    const filteredSpaceManagers = computed(() => {
      return unref(filteredSpaceMembers).filter((m) => m.roleType === 'manager')
    })
    const filteredSpaceEditors = computed(() => {
      return unref(filteredSpaceMembers).filter((m) => m.roleType === 'editor')
    })
    const filteredSpaceViewers = computed(() => {
      return unref(filteredSpaceMembers).filter((m) => m.roleType === 'viewer')
    })

    watch(filterTerm, () => {
      if (unref(membersListRef)) {
        markInstance.value = new Mark(unref(membersListRef))
        unref(markInstance).unmark()
        unref(markInstance).mark(unref(filterTerm), {
          element: 'span',
          className: 'highlight-mark'
        })
      }
    })

    return {
      filterTerm,
      filteredSpaceMembers,
      filteredSpaceManagers,
      filteredSpaceEditors,
      filteredSpaceViewers,
      membersListRef
    }
  }
})
</script>

