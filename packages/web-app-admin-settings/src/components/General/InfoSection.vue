<template>
  <div>
    <h2 class="oc-py-s" v-text="$gettext('Info')" />

    <dl class="details-list">
      <dt v-text="$gettext('ownCloud')" />
      <dd v-text="backendProductName" />
      <dt v-text="$gettext('Edition')" />
      <dd v-text="backendEdition" />
      <dt v-text="$gettext('Version')" />
      <dd v-text="backendVersion" />
      <dt v-text="$gettext('Web client version')" />
      <dd v-text="webClientVersion" />
    </dl>
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

<style lang="scss">
.details-list {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);

  dt,
  dd {
    margin-bottom: var(--oc-space-small);
  }
  dt {
    font-weight: bold;
    white-space: nowrap;
  }
  dd {
    margin-inline-start: var(--oc-space-medium);
  }
}
</style>
