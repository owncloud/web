<template>
  <div>
    <app-template ref="template" :breadcrumbs="breadcrumbs">
      <template #mainContent>
        <div class="oc-px-m">
          <Info />
          <AppearanceSettings />
        </div>
      </template>
    </app-template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import AppTemplate from '../components/AppTemplate.vue'
import Info from '../components/General/Info.vue'
import AppearanceSettings from '../components/General/AppearanceSettings.vue'

export default defineComponent({
  components: {
    Info,
    AppearanceSettings,
    AppTemplate
  },
  setup() {
    const template = ref()

    return {
      template
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
