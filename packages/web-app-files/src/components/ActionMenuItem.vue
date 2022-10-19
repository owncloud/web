<template>
  <li>
    <oc-button
      v-oc-tooltip="showTooltip || action.hideLabel ? action.label(filterParams) : ''"
      :type="action.componentType"
      v-bind="getComponentProps(action, items)"
      :class="[action.class, 'action-menu-item']"
      data-testid="action-handler"
      size="small"
      v-on="getComponentListeners(action, items)"
      :aria-label="action.name"
    >
      <oc-img
        v-if="action.img"
        data-testid="action-img"
        :src="action.img"
        alt=""
        class="oc-icon oc-icon-m"
      />
      <oc-img
        v-else-if="hasExternalImageIcon(action)"
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
      <span
        v-if="!action.hideLabel"
        class="oc-files-context-action-label"
        data-testid="action-label"
        >{{ action.label(filterParams) }}</span
      >
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
    </oc-button>
  </li>
</template>

<script>
export default {
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
        resources: this.items
      }
    }
  },
  methods: {
    getComponentProps(action, resources) {
      const props = {
        appearance: this.appearance,
        ...(action.isDisabled && { disabled: action.isDisabled() }),
        ...(action.variation && { variation: action.variation })
      }

      if (action.componentType === 'router-link' && action.route) {
        return {
          ...props,
          to: action.route({ resources })
        }
      }

      return props
    },

    getComponentListeners(action, resources) {
      if (typeof action.handler !== 'function' || action.componentType !== 'button') {
        return {}
      }

      const callback = () => action.handler({ resources, ...action.handlerData })
      if (action.keepOpen) {
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
    },

    hasExternalImageIcon(action) {
      return action.icon && /^https?:\/\//i.test(action.icon)
    }
  }
}
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
