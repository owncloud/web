<template>
  <div>
    <h2 class="oc-py-s" v-text="$gettext('Info')" />

    <table class="details-table" role="presentation">
      <tr>
        <th scope="col" class="oc-pr-s" v-text="$gettext('ownCloud')" />
        <td v-text="backendProductName" />
      </tr>
      <tr>
        <th scope="col" class="oc-pr-s" v-text="$gettext('Edition')" />
        <td v-text="backendEdition" />
      </tr>
      <tr>
        <th scope="col" class="oc-pr-s" v-text="$gettext('Version')" />
        <td v-text="backendVersion" />
      </tr>
      <tr>
        <th scope="col" class="oc-pr-s" v-text="$gettext('Web client version')" />
        <td v-text="webClientVersion" />
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCapabilityStore } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'InfoSection',
  setup() {
    const capabilityStore = useCapabilityStore()

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

    return {
      webClientVersion,
      backendProductName,
      backendVersion,
      backendEdition
    }
  }
})
</script>
