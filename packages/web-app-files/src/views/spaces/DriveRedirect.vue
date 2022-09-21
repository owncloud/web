<template>
  <div class="oc-flex oc-width-1-1">
    <app-loading-spinner />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, unref } from '@vue/composition-api'
import { useRoute, useRouter, useStore } from 'web-pkg/src/composables'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import { Resource } from 'web-client'

export default defineComponent({
  name: 'DriveRedirect',
  components: {
    AppLoadingSpinner
  },
  props: {
    driveAliasAndItem: {
      type: String,
      required: false,
      default: ''
    },
    appendHomeFolder: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup(props) {
    const needsRedirectToPersonalHome = ['', 'personal', 'personal/home'].includes(
      props.driveAliasAndItem
    )

    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const personalSpace = computed(() => {
      return store.getters['runtime/spaces/spaces'].find((space) => space.driveType === 'personal')
    })
    const homeFolder = computed(() => {
      return props.appendHomeFolder ? store.getters.homeFolder : '/'
    })
    return (
      router
        .replace({
          ...unref(route),
          params: {
            ...unref(route).params,
            driveAliasAndItem: unref(personalSpace).getDriveAliasAndItem({
              path: needsRedirectToPersonalHome ? unref(homeFolder) : ''
            } as Resource)
          }
        })
        // avoid NavigationDuplicated error in console
        .catch(() => {})
    )
  }
})
</script>
