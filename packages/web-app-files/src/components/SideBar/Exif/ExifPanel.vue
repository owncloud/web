<template>
  <div id="files-sidebar-panel-exif">
    <dl class="exif-data-list">
      <template v-if="dimensions">
        <dt v-text="$gettext('Dimensions')" />
        <dd v-text="dimensions" />
      </template>
      <template v-if="cameraMake">
        <dt v-text="$gettext('Device make')" />
        <dd v-text="cameraMake" />
      </template>
      <template v-if="cameraModel">
        <dt v-text="$gettext('Device model')" />
        <dd v-text="cameraModel" />
      </template>
      <template v-if="focalLength">
        <dt v-text="$gettext('Focal length')" />
        <dd v-text="focalLength" />
      </template>
      <template v-if="fNumber">
        <dt v-text="$gettext('F number')" />
        <dd v-text="fNumber" />
      </template>
      <template v-if="exposureTime">
        <dt v-text="$gettext('Exposure time')" />
        <dd v-text="exposureTime" />
      </template>
      <template v-if="iso">
        <dt v-text="$gettext('ISO')" />
        <dd v-text="iso" />
      </template>
      <template v-if="orientation">
        <dt v-text="$gettext('Orientation')" />
        <dd v-text="orientation" />
      </template>
      <template v-if="takenDateTime">
        <dt v-text="$gettext('Taken time')" />
        <dd v-text="takenDateTime" />
      </template>
      <template v-if="location">
        <dt v-text="$gettext('Location')" />
        <dd v-if="isCopyToClipboardSupported">
          <span>{{ location }}</span>
          <oc-button
            v-oc-tooltip="copyLocationToClipboardLabel"
            size="small"
            appearance="raw"
            class="oc-ml-s"
            :aria-label="copyLocationToClipboardLabel"
            @click="copyLocationToClipboard"
          >
            <oc-icon size="small" :name="isCopiedToClipboard ? 'checkbox-circle' : 'file-copy'" />
          </oc-button>
        </dd>
        <dd v-else v-text="location" />
      </template>
    </dl>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, Ref, unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { formatDateFromISO, useMessages } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { useClipboard } from '@vueuse/core'

export default defineComponent({
  name: 'ExifPanel',
  setup() {
    const resource = inject<Ref<Resource>>('resource')
    const { current: currentLanguage, $gettext } = useGettext()
    const { showMessage } = useMessages()
    const {
      copy: copyToClipboard,
      copied: isCopiedToClipboard,
      isSupported: isCopyToClipboardSupported
    } = useClipboard({ legacy: true, copiedDuring: 550 })

    const dimensions = computed(() => {
      const image = unref(resource).image
      const width = image?.width
      const height = image?.height
      if (!width || !height) {
        return ''
      }
      if ([5, 6, 7, 8].includes(unref(resource).photo?.orientation)) {
        return `${height}x${width}`
      }
      return `${width}x${height}`
    })

    const cameraMake = computed(() => {
      return unref(resource).photo?.cameraMake
    })

    const cameraModel = computed(() => {
      return unref(resource).photo?.cameraModel
    })

    const focalLength = computed(() => {
      const photo = unref(resource).photo
      return photo?.focalLength ? `${photo.focalLength} mm` : ''
    })

    const fNumber = computed(() => {
      const photo = unref(resource).photo
      return photo?.fNumber ? `f/${photo.fNumber}` : ''
    })

    const exposureTime = computed(() => {
      const photo = unref(resource).photo
      return photo?.exposureDenominator
        ? `${photo.exposureNumerator}/${photo.exposureDenominator}`
        : ''
    })

    const iso = computed(() => {
      return unref(resource).photo?.iso
    })

    const orientation = computed(() => {
      return unref(resource).photo?.orientation
    })

    const takenDateTime = computed(() => {
      const photo = unref(resource).photo
      return photo?.takenDateTime ? formatDateFromISO(photo.takenDateTime, currentLanguage) : ''
    })

    const location = computed(() => {
      const l = unref(resource).location
      if (!l?.latitude || !l?.longitude) {
        return ''
      }
      return `${l.latitude}, ${l.longitude}`
    })

    const copyLocationToClipboard = () => {
      copyToClipboard(unref(location))
      showMessage({
        title: $gettext('The location has been copied to your clipboard.')
      })
    }
    const copyLocationToClipboardLabel = computed(() => {
      return $gettext('Copy location to clipboard')
    })

    return {
      dimensions,
      cameraMake,
      cameraModel,
      focalLength,
      fNumber,
      exposureTime,
      iso,
      orientation,
      takenDateTime,
      location,
      isCopyToClipboardSupported,
      isCopiedToClipboard,
      copyLocationToClipboardLabel,
      copyLocationToClipboard
    }
  }
})
</script>

<style lang="scss">
.exif-data-list {
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
