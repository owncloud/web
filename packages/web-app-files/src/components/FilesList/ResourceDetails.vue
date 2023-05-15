<template>
  <div class="resource-details oc-flex oc-flex-column oc-flex-middle">
    <div class="oc-width-1-3@l oc-width-1-2@m oc-width-3-4">
      <file-info />
      <file-details class="oc-mb" />
      <file-actions />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import { Resource, SpaceResource } from 'web-client/src/helpers'

import FileActions from '../SideBar/Actions/FileActions.vue'
import FileDetails from '../SideBar/Details/FileDetails.vue'
import FileInfo from '../SideBar/FileInfo.vue'
import { useFileActions } from 'web-app-files/src/composables/actions/files/useFileActions'
import {  useRouteQuery } from 'web-pkg'
import { useFileActionsDownloadFile } from 'web-app-files/src/composables/actions'

export default defineComponent({
  components: {
    FileActions,
    FileDetails,
    FileInfo
  },
  provide() {
    return {
      resource: computed(() => this.singleResource),
      space: computed(() => this.space)
    }
  },
  props: {
    singleResource: {
      type: Object as PropType<Resource>,
      required: false,
      default: null
    },
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
    }
  },
  setup(props) {
    const { getDefaultAction, triggerDefaultAction } = useFileActions()
    const fileActionsDownloadFile = useFileActionsDownloadFile()
    const openWithDefaultAppQuery = useRouteQuery('openWithDefaultApp')

    const hasDefaultAction =
      getDefaultAction({
        resources: [props.singleResource],
        space: props.space
      })?.name !== unref(fileActionsDownloadFile.actions)[0].name

    if (unref(openWithDefaultAppQuery) == 'true' && hasDefaultAction) {
      triggerDefaultAction({ resources: [props.singleResource], space: props.space })
    }
  }
})
</script>
