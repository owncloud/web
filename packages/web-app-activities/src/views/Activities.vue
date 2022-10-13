<template>
  <main class="oc-height-1-1 app-content oc-width-1-1">
    <app-loading-spinner v-if="loadActivitiesTask.isRunning" />
    <timeline
      v-else-if="loadActivitiesTask.lastSuccessful.value.length"
      :activities="loadActivitiesTask.lastSuccessful.value"
    ></timeline>
    <no-content-message v-else icon="folder" class="activities-empty">
      <template #message>
        <p class="oc-text-muted">
          <span v-translate>No activities</span>
        </p>
      </template>
    </no-content-message>
  </main>
</template>

<script lang="ts">
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import Timeline from '../components/Timeline.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { defineComponent } from '@vue/runtime-core'
import { useStore, useRequest } from 'web-pkg/src/composables'
import { useTranslations } from 'web-pkg/src/composables/translations'
import { useTask } from 'vue-concurrency'
import { DateTime } from 'luxon'
import { formatRelativeDateFromDateTime } from 'web-pkg/src/helpers'

const buildActivity = ({ type, dateTime, data }, { $gettext, $gettextInterpolate }) => {
  const activity = {
    title: data.filename,
    icon: {
      name: 'check',
      fill: 'line',
      variation: 'passive'
    },
    body: '',
    tags: [formatRelativeDateFromDateTime(DateTime.fromISO(dateTime), navigator.language)]
  }

  switch (type) {
    case 'VirusscanFinished':
      activity.tags.push('virus-scan')

      if (data.infected) {
        activity.icon.name = 'file-warning'
        activity.icon.variation = 'warning'
      }

      if (data.description) {
        activity.body = $gettextInterpolate(
          $gettext(
            'Virus "%{description}" detected. Please contact your administrator for more information.'
          ),
          { description: data.description },
          true
        )
      }

      if (data.outcome === 'delete') {
        activity.tags.push('deleted')
      }
  }

  return activity
}

export default defineComponent({
  components: {
    AppLoadingSpinner,
    Timeline,
    NoContentMessage
  },
  setup() {
    const store = useStore()
    const { makeRequest } = useRequest()
    const translationHelpers = useTranslations()
    const loadActivitiesTask = useTask(function* (signal) {
      const { data } = yield makeRequest(
        'GET',
        `${store.getters.configuration.server}experimental/activities`,
        {}
      )

      return data.reduce((acc, act) => [...acc, buildActivity(act, translationHelpers)], [])
    })

    loadActivitiesTask.perform()

    return {
      loadActivitiesTask
    }
  }
})
</script>

<style lang="scss" scoped>
main {
  overflow-y: auto;
}
</style>
