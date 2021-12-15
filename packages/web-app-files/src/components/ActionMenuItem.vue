<template>
  <li>
    <component
      :is="action.componentType"
      v-bind="getComponentProps(action, items)"
      :class="['oc-text-bold', action.class]"
      data-testid="action-handler"
      v-on="getComponentListeners(action, items)"
    >
      <oc-img
        v-if="action.img"
        data-testid="action-img"
        :src="action.img"
        alt=""
        class="oc-icon oc-icon-m"
      />
      <oc-icon
        v-else-if="action.icon"
        data-testid="action-icon"
        :name="action.icon"
        size="medium"
      />
      <span class="oc-files-context-action-label" data-testid="action-label">{{
        action.label(filterParams)
      }}</span>
      <span
        v-if="action.opensInNewWindow"
        data-testid="action-sr-hint"
        class="oc-invisible-sr"
        v-text="$gettext('(Opens in new window)')"
      />
    </component>
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
      if (action.componentType === 'router-link' && action.route) {
        return {
          to: {
            name: action.route,
            params: {
              item: resources.map((resource) => resource.path)
            }
          }
        }
      }

      return {
        appearance: this.appearance,
        ...(action.isDisabled && { disabled: action.isDisabled() }),
        ...(action.variation && { variation: action.variation })
      }
    },

    getComponentListeners(action, resources) {
      if (typeof action.handler !== 'function' || action.componentType !== 'oc-button') {
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
    }
  }
}
</script>
