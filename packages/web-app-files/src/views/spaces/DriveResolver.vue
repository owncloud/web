<template>
  <div>
    <h2>{{ driveAliasAndItem }}</h2>
    <p v-if="spacesLoading">Loading...</p>
    <template v-else>
      <p>Number of spaces loaded: {{ spaces.length }}</p>
      <p v-if="space">
        found matching space. {{ space.id }} driveAlias: {{ space.driveAlias }}, item: {{ item }}
      </p>
      <p v-else>no matching space found</p>
      <Personal v-if="space.driveType === 'personal'" :space="space" />
      <Project v-else :space="space" />
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, unref } from '@vue/composition-api'
import { useRouteParam, useStore } from 'web-pkg/src/composables'
import Personal from '../../views/Personal.vue'
import Project from '../../views/spaces/Project.vue'

export default defineComponent({
  components: {
    Personal,
    Project
  },
  setup() {
    const store = useStore()
    const spacesLoading = computed(() => store.getters['runtime/spaces/spacesLoading'])
    const spaces = computed(() => store.getters['runtime/spaces/spaces'])

    const driveAliasAndItem = useRouteParam('driveAliasAndItem')
    const space = computed(() => {
      let matchingSpace = null
      unref(spaces).forEach((space) => {
        if (!space.driveAlias) {
          // TODO: ever the case?!
          console.log('found empty drive alias in space', space)
          return
        }
        if (!unref(driveAliasAndItem).startsWith(space.driveAlias)) {
          return
        }
        if (!matchingSpace || space.driveAlias.length > matchingSpace.driveAlias.length) {
          matchingSpace = space
        }
      })
      return matchingSpace
    })
    const item = computed(() => {
      if (!unref(space)) {
        return unref(driveAliasAndItem)
      }
      return unref(driveAliasAndItem).slice(unref(space).driveAlias.length)
    })
    return {
      driveAliasAndItem,
      spacesLoading,
      spaces,
      space,
      item
    }
  }
})
</script>
