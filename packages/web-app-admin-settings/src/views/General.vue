<template>
  <div>
    <app-template ref="template" :breadcrumbs="breadcrumbs">
      <template #mainContent>
        <AppearanceSettings />
      </template>
    </app-template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, unref } from 'vue'
import { useTask } from 'vue-concurrency'
import { useGraphClient } from 'web-pkg/src/composables'
import AppTemplate from '../components/AppTemplate.vue'
import AppearanceSettings from '../components/General/AppearanceSettings.vue'

export default defineComponent({
  components: {
    AppearanceSettings,
    AppTemplate
  },
  setup() {
    const groups = ref([])
    const template = ref()
    const { graphClient } = useGraphClient()

    const loadResourcesTask = useTask(function* (signal) {
      const response = yield unref(graphClient).groups.listGroups('displayName')
      groups.value = response.data.value || []
      groups.value.forEach((group) => {
        group.members = group.members || []
      })
    })

    return {
      groups,
      template,
      loadResourcesTask,
      graphClient
    }
  },
  computed: {
    breadcrumbs() {
      return [
        { text: this.$gettext('Administration Settings'), to: { path: '/admin-settings' } },
        {
          text: this.$gettext('General')
        }
      ]
    }
  }
})
</script>
