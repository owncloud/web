<template>
  <div class="oc-ml-s">
    <oc-text-input
      v-model="filterTerm"
      class="oc-text-truncate oc-mr-s oc-mt-m"
      :label="$gettext('Filter members')"
    />
    <div ref="membersListRef" data-testid="space-members">
      <div v-if="!filteredSpaceMembers.length">
        <h3 class="oc-text-bold oc-text-medium" v-text="$gettext('No members found')" />
      </div>
      <div
        v-if="filteredSpaceManagers.length"
        class="oc-mb-m"
        data-testid="space-members-role-managers"
      >
        <h3 class="oc-text-bold oc-text-medium" v-text="$gettext('Managers')" />
        <members-role-section :members="filteredSpaceManagers" />
      </div>
      <div
        v-if="filteredSpaceEditors.length"
        class="oc-mb-m"
        data-testid="space-members-role-editors"
      >
        <h3 class="oc-text-bold oc-text-medium" v-text="$gettext('Editors')" />
        <members-role-section :members="filteredSpaceEditors" />
      </div>
      <div
        v-if="filteredSpaceViewers.length"
        class="oc-mb-m"
        data-testid="space-members-role-viewers"
      >
        <h3 class="oc-text-bold oc-text-medium" v-text="$gettext('Viewers')" />
        <members-role-section :members="filteredSpaceViewers" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, inject, ref, watch, unref } from 'vue'
import { SpaceResource, SpaceRole } from '@ownclouders/web-client'
import MembersRoleSection from './MembersRoleSection.vue'
import Fuse from 'fuse.js'
import Mark from 'mark.js'
import { defaultFuseOptions } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'MembersPanel',
  components: { MembersRoleSection },
  setup() {
    const resource = inject<SpaceResource>('resource')
    const filterTerm = ref('')
    const markInstance = ref(null)
    const membersListRef = ref(null)
    const filterMembers = (collection: Array<SpaceRole & { roleType: string }>, term: string) => {
      if (!(term || '').trim()) {
        return collection
      }

      const searchEngine = new Fuse(collection, { ...defaultFuseOptions, keys: ['displayName'] })
      return searchEngine.search(term).map((r) => r.item)
    }

    const spaceMembers = computed(() => {
      return [
        ...unref(resource).spaceRoles.manager.map((r) => ({
          ...r,
          roleType: 'manager'
        })),
        ...unref(resource).spaceRoles.editor.map((r) => ({
          ...r,
          roleType: 'editor'
        })),
        ...unref(resource).spaceRoles.viewer.map((r) => ({
          ...r,
          roleType: 'viewer'
        }))
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
          className: 'mark-highlight'
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
