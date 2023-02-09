<template>
  <li>
    <oc-button
      v-oc-tooltip="showTooltip || action.hideLabel ? action.label(filterParams) : ''"
      :type="action.componentType"
      v-bind="componentProps"
      :class="[action.class, 'action-menu-item']"
      data-testid="action-handler"
      size="small"
      v-on="componentListeners"
    >
      <div class="oc-flex oc-flex-middle oc-width-1-1">
        <div class="oc-flex oc-mr-s">
          <oc-img
            v-if="action.img"
            data-testid="action-img"
            :src="action.img"
            alt=""
            class="oc-icon oc-icon-m"
          />
          <oc-img
            v-else-if="hasExternalImageIcon"
            data-testid="action-img"
            :src="action.icon"
            alt=""
            class="oc-icon oc-icon-m"
          />
          <oc-icon
            v-else-if="action.icon"
            data-testid="action-icon"
            :name="action.icon"
            :fill-type="action.iconFillType || 'line'"
            size="medium"
          />
        </div>
        <div class="oc-flex oc-flex-column">
          <span
            v-if="!action.hideLabel"
            class="oc-files-context-action-label"
            data-testid="action-label"
            >{{ action.label(filterParams) }}</span
          >
          <span
            v-if="action.meta"
            class="oc-files-context-action-meta oc-text-meta oc-mt-xs"
            data-testid="action-meta"
            v-text="action.meta()"
          />
        </div>
        <span
          v-if="action.shortcut && shortcutHint"
          class="oc-files-context-action-shortcut"
          v-text="action.shortcut"
        />
        <span
          v-if="action.opensInNewWindow"
          data-testid="action-sr-hint"
          class="oc-invisible-sr"
          v-text="$gettext('(Opens in new window)')"
        />
      </div>
    </oc-button>
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { SpaceResource } from 'web-client/src/helpers'

export default defineComponent({
  name: 'ActionMenuItem',
  props: {
    action: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
    },
    appearance: {
      type: String,
      default: 'raw'
    },
    shortcutHint: {
      type: Boolean,
      default: true,
      required: false
    },
    showTooltip: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  computed: {
    filterParams() {
      return {
        space: this.space,
        resources: this.items
      }
    },
    hasExternalImageIcon() {
      return this.action.icon && /^https?:\/\//i.test(this.action.icon)
    },
    componentProps() {
      const props = {
        appearance: this.appearance,
        ...(this.action.isDisabled && { disabled: this.action.isDisabled() }),
        ...(this.action.variation && { variation: this.action.variation })
      }

      if (this.action.componentType === 'router-link' && this.action.route) {
        return {
          ...props,
          to: this.action.route(this.filterParams)
        }
      }

      return props
    },
    componentListeners() {
      if (typeof this.action.handler !== 'function' || this.action.componentType !== 'button') {
        return {}
      }

      const callback = () =>
        this.action.handler({
          ...this.filterParams,
          ...this.action.handlerData
        })
      if (this.action.keepOpen) {
        return {
          click: (event) => {
            event.stopPropagation()
            callback()
          }
        }
      }
      return {
        click: callback
      }
    }
  }
})
</script>
<style lang="scss">
.action-menu-item {
  vertical-align: middle;
}
.oc-files-context-action-shortcut {
  justify-content: right !important;
  font-size: var(--oc-font-size-small);
  font-weight: bold !important;
  opacity: 0.7;
}
</style>
