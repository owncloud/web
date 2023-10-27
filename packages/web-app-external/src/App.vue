<template>
  <iframe
    v-if="appUrl && method === 'GET'"
    :src="appUrl"
    class="oc-width-1-1 oc-height-1-1"
    :title="iFrameTitle"
    allowfullscreen
  />
  <div v-if="appUrl && method === 'POST' && formParameters" class="oc-height-1-1">
    <form :action="appUrl" target="app-iframe" method="post">
      <input ref="subm" type="submit" :value="formParameters" class="oc-hidden" />
      <div v-for="(item, key, index) in formParameters" :key="index">
        <input :name="key" :value="item" type="hidden" />
      </div>
    </form>
    <iframe
      name="app-iframe"
      class="oc-width-1-1 oc-height-1-1"
      :title="iFrameTitle"
      allowfullscreen
    />
  </div>
</template>

<script lang="ts">
import { stringify } from 'qs'
import { PropType, computed, defineComponent, unref, nextTick, ref, watch, VNodeRef } from 'vue'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'

import { Resource, SpaceResource } from '@ownclouders/web-client/src'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import {
  isSameResource,
  queryItemAsString,
  useRequest,
  useRouteQuery,
  useStore
} from '@ownclouders/web-pkg'
import { configurationManager } from '@ownclouders/web-pkg'
import { isPublicSpaceResource, isShareSpaceResource } from '@ownclouders/web-client/src/helpers'

export default defineComponent({
  name: 'ExternalApp',
  props: {
    space: { type: Object as PropType<SpaceResource>, required: true },
    resource: { type: Object as PropType<Resource>, required: true },
    isReadOnly: { type: Boolean, required: true }
  },
  emits: ['update:applicationName'],
  setup(props, { emit }) {
    const language = useGettext()
    const store = useStore()

    const { $gettext } = language
    const { makeRequest } = useRequest()

    const appNameQuery = useRouteQuery('app')
    const appUrl = ref()
    const formParameters = ref({})
    const method = ref()
    const subm: VNodeRef = ref()

    const capabilities = computed(() => store.getters['capabilities'])
    const applicationName = computed(() => {
      const appName = queryItemAsString(unref(appNameQuery))
      emit('update:applicationName', appName)
      return appName
    })

    const iFrameTitle = computed(() => {
      return $gettext('"%{appName}" app content area', {
        appName: unref(applicationName)
      })
    })

    const errorPopup = (error) => {
      store.dispatch('showErrorMessage', {
        title: $gettext('An error occurred'),
        desc: error,
        error
      })
    }

    const loadAppUrl = useTask(function* (signal, viewMode: string) {
      try {
        if (props.isReadOnly && viewMode === 'write') {
          store.dispatch('showErrorMessage', {
            title: $gettext('Cannot open file in edit mode as it is read-only')
          })
          return
        }

        const fileId = props.resource.fileId
        const baseUrl = urlJoin(
          configurationManager.serverUrl,
          unref(capabilities).files.app_providers[0].open_url
        )

        const query = stringify({
          file_id: fileId,
          lang: language.current,
          ...(unref(applicationName) && { app_name: unref(applicationName) }),
          ...(viewMode && { view_mode: viewMode })
        })

        const url = `${baseUrl}?${query}`
        const response = yield makeRequest('POST', url, {
          validateStatus: () => true
        })

        if (response.status !== 200) {
          switch (response.status) {
            case 425:
              errorPopup(
                $gettext(
                  'This file is currently being processed and is not yet available for use. Please try again shortly.'
                )
              )
              break
            default:
              errorPopup(response.data?.message)
          }

          const error = new Error('Error fetching app information')
          throw error
        }

        if (!response.data.app_url || !response.data.method) {
          const error = new Error('Error in app server response')
          throw error
        }

        appUrl.value = response.data.app_url
        method.value = response.data.method

        if (response.data.form_parameters) {
          formParameters.value = response.data.form_parameters
        }

        if (method.value === 'POST' && formParameters.value) {
          // eslint-disable-next-line vue/valid-next-tick
          yield nextTick()
          unref(subm).click()
        }
      } catch (e) {
        console.error('web-app-external error', e)
        throw e
      }
    }).restartable()

    // switch to write mode when edit is clicked
    const catchClickMicrosoftEdit = (event) => {
      try {
        if (JSON.parse(event.data)?.MessageId === 'UI_Edit') {
          loadAppUrl.perform('write')
        }
      } catch (e) {}
    }
    watch(
      applicationName,
      (newAppName, oldAppName) => {
        console.log('appNames', newAppName, oldAppName)
        if (newAppName === 'Office365' && newAppName !== oldAppName) {
          window.addEventListener('message', catchClickMicrosoftEdit)
        } else {
          window.removeEventListener('message', catchClickMicrosoftEdit)
        }
      },
      {
        immediate: true
      }
    )

    watch(
      [props.resource],
      ([newResource], [oldResource]) => {
        if (isSameResource(newResource, oldResource)) {
          return
        }

        let viewMode = props.isReadOnly ? 'view' : 'write'
        // FIXME: introduce config option (?)
        const featureFlag = true
        if (
          featureFlag &&
          (isShareSpaceResource(props.space) || isPublicSpaceResource(props.space))
        ) {
          viewMode = 'view'
        }
        loadAppUrl.perform(unref(viewMode))
      },
      { immediate: true, deep: true }
    )

    return {
      appUrl,
      formParameters,
      iFrameTitle,
      method,
      subm
    }
  }
})
</script>
