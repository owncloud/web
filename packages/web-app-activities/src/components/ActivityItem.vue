<template>
  <div class="oc-flex oc-flex-middle activity-item">
    <div class="oc-flex oc-flex-middle">
      <oc-avatar :width="36" :user-name="activity.template.variables.user.displayName" />
      <span class="oc-ml-s" v-text="activity.template.variables.user.displayName" />
    </div>
    <div>activity unknown</div>
    <div class="oc-text-truncate">
      <resource-list-item v-if="resource" :resource="resource" :is-resource-clickable="false" />
      <div
        v-if="resourceNotAccessible"
        v-oc-tooltip="$gettext('The resource is unavailable, it may have been deleted.')"
        class="oc-text-muted oc-flex oc-flex-middle oc-p-xs"
      >
        <oc-icon name="eye-off" />
        <span class="oc-ml-s" v-text="activity.template.variables.resource.name" />
      </div>
    </div>
    <div><span v-text="recordedDateTime" /></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, unref } from 'vue'
import { Activity } from '@ownclouders/web-client/graph/generated'
import { DateTime } from 'luxon'
import {
  formatDateFromDateTime,
  formatRelativeDateFromDateTime,
  ResourceListItem,
  useClientService
} from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { Resource } from '@ownclouders/web-client'
import { DavProperty } from '@ownclouders/web-client/webdav'

export default defineComponent({
  name: 'ActivityList',
  components: { ResourceListItem },
  props: {
    activity: {
      type: Object as PropType<Activity>,
      required: true
    }
  },
  setup(props) {
    const clientService = useClientService()
    const { current: currentLanguage } = useGettext()
    const resource = ref<Resource>()
    const resourceNotAccessible = ref(false)

    const recordedDateTime = computed(() => {
      const dateTime = DateTime.fromISO(props.activity.times.recordedTime)

      const isWithinLastHour = dateTime > DateTime.now().minus({ hour: 1 })
      if (isWithinLastHour) {
        return formatRelativeDateFromDateTime(dateTime, currentLanguage)
      }

      return formatDateFromDateTime(dateTime, currentLanguage)
    })

    onMounted(async () => {
      try {
        resource.value = await clientService.webdav.getFileInfo(
          unref(props.activity.template.variables.space.id),
          { fileId: props.activity.template.variables.resource.id },
          { davProperties: DavProperty.name }
        )
      } catch (e) {
        resourceNotAccessible.value = true
      }
    })

    return {
      recordedDateTime,
      resource,
      resourceNotAccessible
    }
  }
})
</script>

<style lang="scss">
.activity-item {
  .oc-resource-name {
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
  }
}

.activity-item > * {
  flex: 1;
  text-align: left;
}

.activity-item > *:last-child {
  text-align: right !important;
}
</style>
