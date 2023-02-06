<template>
  <div>
    <h2 class="oc-py-s" v-text="$gettext('Appearance')" />
    <div>
      <div class="oc-flex oc-flex-middle">
        <h3>Logo</h3>
        <oc-button
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
          <context-action-menu :menu-sections="menuSections" :items="menuItems" />
        </oc-drop>
      </div>
      <div>{placeHolderLogo}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, computed, unref } from 'vue'
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'
import UploadLogo from '../../mixins/general/uploadLogo'
import ResetLogo from '../../mixins/general/resetLogo'

export default defineComponent({
  name: 'AppearanceSection',
  mixins: [UploadLogo, ResetLogo],
  components: {
    ContextActionMenu
  },
  setup() {
    const instance = getCurrentInstance().proxy as any
    const menuItems = computed(() => [
      ...instance.$_uploadLogo_items,
      ...instance.$_resetLogo_items
    ])

    const menuSections = computed(() => [
      {
        name: 'primaryActions',
        items: unref(menuItems)
      }
    ])

    return {
      menuItems,
      menuSections
    }
  }
})
</script>
