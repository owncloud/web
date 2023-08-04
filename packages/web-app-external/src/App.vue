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

import { Resource } from 'web-client/src'
import { urlJoin } from 'web-client/src/utils'
import { queryItemAsString, useRequest, useRouteQuery, useStore } from 'web-pkg/src/composables'
import { configurationManager } from 'web-pkg/src/configuration'

export default defineComponent({
  name: 'ExternalApp',
  props: {
    resource: { type: Object as PropType<Resource>, required: true }
  },
  setup(props) {
    const language = useGettext()
    const store = useStore()

    const { $gettext, interpolate: $gettextInterpolate } = language
    const { makeRequest } = useRequest()

    const appName = useRouteQuery('app')
    const appUrl = ref()
    const formParameters = ref({})
    const method = ref()
    const subm: VNodeRef = ref()

    const capabilities = computed(() => store.getters['capabilities'])
    // FIXME: Make available to appDefaults composable for pageTitle
    const applicationName = computed(() => queryItemAsString(unref(appName)))

    const iFrameTitle = computed(() => {
      const translated = $gettext('"%{appName}" app content area')
      return $gettextInterpolate(translated, {
        appName: unref(applicationName)
      })
    })

    // TODO: Extract within web-pkg with default title?
    const errorPopup = (error) => {
      store.dispatch('showErrorMessage', {
        title: $gettext('An error occurred'),
        desc: error,
        error
      })
    }

    const loadAppUrl = useTask(function* () {
      try {
        // FIXME: make all updates atomic/happen at once so the ui can never mix data from different resources
        const fileId = props.resource.fileId

        const baseUrl = urlJoin(
          configurationManager.serverUrl,
          unref(capabilities).files.app_providers[0].open_url
        )

        const query = stringify({
          file_id: fileId,
          lang: language.current,
          ...(unref(applicationName) && { app_name: unref(applicationName) })
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

          console.error('Error fetching app information', response.status, response.data.message)
          return
        }

        if (!response.data.app_url || !response.data.method) {
          console.error('Error in app server response')
          return
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
        console.error(e)
      }
    }).restartable()

    watch(
      props.resource,
      () => {
        loadAppUrl.perform()
      },
      { immediate: true }
    )

    return {
      iFrameTitle,
      applicationName,
      appUrl,
      formParameters,
      method,
      subm
    }
  }
})
</script>
