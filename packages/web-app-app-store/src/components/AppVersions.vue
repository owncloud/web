<template>
  <oc-table
    class="oc-width-1-1"
    :data="data"
    :fields="fields"
    padding-x="remove"
    :has-header="false"
  >
    <template #version="{ item }">
      v{{ item.version }}
      <oc-tag v-if="item.version === app.mostRecentVersion.version" size="small" class="oc-ml-s">
        {{ $gettext('most recent') }}
      </oc-tag>
    </template>
    <template #actions="{ item }">
      <app-actions :app="app" :version="item" />
    </template>
  </oc-table>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { App } from '../types'
import { useGettext } from 'vue3-gettext'
import AppActions from './AppActions.vue'

export default defineComponent({
  name: 'AppVersions',
  components: { AppActions },
  props: {
    app: {
      type: Object as PropType<App>,
      required: true
    }
  },
  setup(props) {
    const { $gettext } = useGettext()

    const data = computed(() => {
      return props.app.versions
    })
    const fields = computed(() => {
      return [
        {
          name: 'version',
          type: 'slot',
          width: 'expand',
          wrap: 'truncate'
        },
        {
          name: 'actions',
          type: 'slot',
          alignH: 'right',
          width: 'shrink',
          wrap: 'nowrap'
        }
      ]
    })

    return {
      data,
      fields
    }
  }
})
</script>
