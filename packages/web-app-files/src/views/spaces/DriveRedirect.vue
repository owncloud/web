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
import { urlJoin } from 'web-pkg/src/utils'

// 'personal/home' is used as personal drive alias from static contexts
// (i.e. places where we can't load the actual personal space)
const fakePersonalDriveAlias = 'personal/home'

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
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const personalSpace = computed(() => {
      return store.getters['runtime/spaces/spaces'].find((space) => space.driveType === 'personal')
    })
    const itemPath = computed(() => {
      if (!props.appendHomeFolder) {
        return ''
      }
      const item = props.driveAliasAndItem.startsWith(fakePersonalDriveAlias)
        ? urlJoin(props.driveAliasAndItem.slice(fakePersonalDriveAlias.length))
        : '/'
      if (item !== '/') {
        return item
      }
      return store.getters.homeFolder
    })

    return (
      router
        .replace({
          ...unref(route),
          params: {
            ...unref(route).params,
            driveAliasAndItem: unref(personalSpace).getDriveAliasAndItem({
              path: unref(itemPath)
            } as Resource)
          }
        })
        // avoid NavigationDuplicated error in console
        .catch(() => {})
    )
  }
})
</script>
