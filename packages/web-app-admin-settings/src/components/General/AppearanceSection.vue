<template>
  <div>
    <h2 class="oc-py-s" v-text="$gettext('Appearance')" />
    <div>
      <div class="oc-flex oc-flex-middle">
        <h3 v-text="$gettext('Logo')" />
        <oc-button
          v-if="menuItems.length"
          :id="`logo-context-btn`"
          v-oc-tooltip="$gettext('Show context menu')"
          :aria-label="$gettext('Show context menu')"
          appearance="raw"
          class="oc-ml-s"
        >
          <oc-icon name="more-2" />
        </oc-button>
        <oc-drop
          :drop-id="`space-context-drop`"
          :toggle="`#logo-context-btn`"
          mode="click"
          close-on-click
          padding-size="small"
        >
          <context-action-menu :menu-sections="menuSections" :action-options="actionOptions" />
        </oc-drop>
      </div>
      <div>
        <div class="logo-wrapper">
          <img alt="" :src="logo" class="oc-p-xs" />
        </div>
        <input
          id="logo-upload-input"
          ref="logoInput"
          type="file"
          name="file"
          tabindex="-1"
          :accept="supportedLogoMimeTypesAcceptValue"
          @change="uploadImage"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, unref, VNodeRef, ref } from 'vue'
import { ContextActionMenu } from '@ownclouders/web-pkg'
import {
  useGeneralActionsResetLogo,
  useGeneralActionsUploadLogo
} from '../../composables/actions/general'
import { supportedLogoMimeTypes } from '../../defaults'
import { useStore } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'AppearanceSection',
  components: {
    ContextActionMenu
  },
  setup() {
    const store = useStore()

    const logoInput: VNodeRef = ref(null)

    const { actions: resetLogoActions } = useGeneralActionsResetLogo({ store })
    const { actions: uploadLogoActions, uploadImage } = useGeneralActionsUploadLogo({
      imageInput: logoInput
    })

    const menuItems = computed(() =>
      [...unref(uploadLogoActions), ...unref(resetLogoActions)].filter((i) => i.isEnabled())
    )

    const actionOptions = computed(() => ({
      resources: unref(menuItems)
    }))

    const logo = computed(() => store.getters.configuration.currentTheme.logo.topbar)
    const menuSections = computed(() => [
      {
        name: 'primaryActions',
        items: unref(menuItems)
      }
    ])

    const supportedLogoMimeTypesAcceptValue = supportedLogoMimeTypes.join(',')

    return {
      actionOptions,
      logo,
      menuItems,
      menuSections,
      supportedLogoMimeTypesAcceptValue,
      uploadImage,
      logoInput
    }
  }
})
</script>

<style lang="scss" scoped>
#logo-upload-input {
  display: none;
}
.logo-wrapper {
  width: 280px;
  min-width: 280px;
  aspect-ratio: 16/9;
  max-height: 158px;

  img {
    border-radius: 10px;
    width: 100%;
    max-height: 100%;
    object-fit: cover;
    background: var(--oc-color-swatch-brand-default);
  }
}
</style>
