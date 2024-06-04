<template>
  <div ref="rootElement">
    <app-loading-spinner v-if="isLoading" />
    <template v-else>
      <p v-if="!activities.length" v-text="$gettext('No activities available for this resource')" />
      <div v-else class="oc-ml-s">
        <ul class="timeline">
          <li v-for="activity in activities" :key="activity.id">
            <span v-html="getHtmlFromActivity(activity)" />
            <span
              class="oc-text-muted oc-text-small oc-mt-s"
              v-text="getTimeFromActivity(activity)"
            />
          </li>
        </ul>
        <p class="oc-text-muted oc-text-small" v-text="activitiesLimitText" />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onBeforeUnmount, onMounted, Ref, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import {
  AppLoadingSpinner,
  formatDateFromDateTime,
  useClientService,
  VisibilityObserver
} from '@ownclouders/web-pkg'
import { useTask } from 'vue-concurrency'
import { call, Resource } from '@ownclouders/web-client'
import { DateTime } from 'luxon'
import { Activity } from '@ownclouders/web-client/graph/generated'

const visibilityObserver = new VisibilityObserver()
export default defineComponent({
  name: 'ActivitiesPanel',
  components: { AppLoadingSpinner },
  setup() {
    const rootElement = ref<HTMLElement>()
    const { $gettext, current: currentLanguage } = useGettext()
    const { graphAuthenticated } = useClientService()
    const resource = inject<Ref<Resource>>('resource')
    const activities = ref<Activity[]>([])
    const activitiesLimit = 200

    const activitiesLimitText = computed(() => {
      return $gettext('(Showing latest %{activitiesLimit} activities)', {
        activitiesLimit: activitiesLimit.toString()
      })
    })

    const loadActivitiesTask = useTask(function* (signal) {
      const {
        data: { value: activitiesResponse }
      } = yield* call(
        graphAuthenticated.activities.listActivities(
          `itemid:${unref(resource).id} AND limit:${activitiesLimit} AND sort:desc`
        )
      )

      activities.value = activitiesResponse
    })

    const isLoading = computed(() => {
      return loadActivitiesTask.isRunning || !loadActivitiesTask.last
    })

    const getHtmlFromActivity = (activity: Activity) => {
      let message = activity.template.message
      for (const [key, value] of Object.entries(activity.template.variables)) {
        message = message.replace(
          `{${key}}`,
          `<strong>${value.displayName || value.name}</strong>`
        )
      }
      return message
    }

    const getTimeFromActivity = (activity: Activity) => {
      const dateTime = DateTime.fromISO(activity.times.recordedTime)
      return formatDateFromDateTime(dateTime, currentLanguage)
    }

    onMounted(() => {
      visibilityObserver.observe(unref(rootElement), {
        onEnter: () => loadActivitiesTask.perform()
      })
    })

    onBeforeUnmount(() => {
      visibilityObserver.disconnect()
    })

    return {
      rootElement,
      activities,
      activitiesLimit,
      activitiesLimitText,
      isLoading,
      loadActivitiesTask,
      getHtmlFromActivity,
      getTimeFromActivity
    }
  }
})
</script>

<style lang="scss">
.timeline {
  position: relative;
  list-style: none;
  padding: 0;
  margin: 0;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 1.5px;
    background-color: var(--oc-color-border);
  }

  li {
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 10px 20px 10px 30px;
    width: 100%;
    box-sizing: border-box;

    &::before {
      content: '';
      width: 10px;
      height: 10px;
      background-color: var(--oc-color-border);
      border-radius: 50%;
      position: absolute;
      left: -4px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }
  }
}
</style>
