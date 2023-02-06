<template>
  <div>
    <app-template ref="template" :breadcrumbs="breadcrumbs">
      <template #mainContent>
        <div class="oc-px-m">
          <InfoSection />
          <AppearanceSection />
        </div>
      </template>
    </app-template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import AppTemplate from '../components/AppTemplate.vue'
import InfoSection from '../components/General/InfoSection.vue'
import AppearanceSection from '../components/General/AppearanceSection.vue'

export default defineComponent({
  components: {
    AppearanceSection,
    AppTemplate,
    InfoSection
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
