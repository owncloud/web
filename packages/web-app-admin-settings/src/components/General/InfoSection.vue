<template>
  <div>
    <h2 class="oc-py-s" v-text="$gettext('Info')" />
    <oc-definition-list :items="infoItems" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCapabilityStore } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'InfoSection',
  setup() {
    const capabilityStore = useCapabilityStore()
    const { $gettext } = useGettext()

    let backendProductName = ''
    let backendVersion = ''
    let backendEdition = ''
    let webClientVersion = ''

    const backendStatus = capabilityStore.status

    if (backendStatus && backendStatus.versionstring) {
      backendProductName = backendStatus.product || 'ownCloud'
      backendVersion = backendStatus.productversion || backendStatus.versionstring
      backendEdition = backendStatus.edition
      webClientVersion = process.env.PACKAGE_VERSION
    }

    const infoItems = [
      { term: $gettext('ownCloud'), definition: backendProductName },
      { term: $gettext('Edition'), definition: backendEdition },
      { term: $gettext('Version'), definition: backendVersion },
      { term: $gettext('Web client version'), definition: webClientVersion }
    ]

    return {
      backendProductName,
      backendVersion,
      backendEdition,
      infoItems,
      webClientVersion
    }
  }
})
</script>
