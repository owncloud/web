<template>
  <div class="oc-status-indicators">
    <template v-for="indicator in indicators">
      <oc-button
        v-if="hasHandler(indicator)"
        :id="indicator.id"
        :key="indicator.id"
        v-oc-tooltip="indicator.label"
        class="oc-status-indicators-indicator oc-background-primary-gradient oc-p-xs oc-ml-xs"
        :aria-label="indicator.label"
        :aria-describedby="getIndicatorDescriptionId(indicator)"
        appearance="raw"
        variation="inverse"
        :data-testid="indicator.id"
        :data-test-indicator-type="indicator.type"
        @click="indicator.handler(resource, indicator.target)"
      >
        <oc-icon :name="indicator.icon" size="small" fill-type="line" />
      </oc-button>
      <oc-icon
        v-else
        :id="indicator.id"
        :key="indicator.id"
        v-oc-tooltip="indicator.label"
        tabindex="-1"
        size="small"
        class="oc-status-indicators-indicator"
        :name="indicator.icon"
        :fill-type="indicator.fillType"
        :accessible-label="indicator.label"
        :aria-describedby="getIndicatorDescriptionId(indicator)"
        :data-testid="indicator.id"
        :data-test-indicator-type="indicator.type"
      />
      <p
        v-if="getIndicatorDescriptionId(indicator)"
        :id="getIndicatorDescriptionId(indicator)"
        :key="getIndicatorDescriptionId(indicator)"
        class="oc-invisible-sr"
        v-text="indicator.accessibleDescription"
      />
    </template>
  </div>
</template>

<script>
import OcIcon from '../OcIcon/OcIcon.vue'
import OcButton from '../OcButton/OcButton.vue'
import uniqueId from '../../utils/uniqueId'

/**
 * Status indicators which can be attatched to a resource
 */
export default {
  name: 'OcStatusIndicators',
  status: 'ready',
  release: '2.0.1',

  components: { OcIcon, OcButton },

  props: {
    /**
     * A resource to which the indicators are attatched to
     */
    resource: {
      type: Object,
      required: true
    },
    /**
     * An array of indicators to be displayed. Indicator object has following properties:
     *
     * Required:
     * id: Id of the indicator
     * icon: Icon of the indicator
     * label: String to be used as a accessible label and tooltip for the indicator
     *
     * Optional:
     * handler: An action to be triggered when the indicator is clicked. Receives the resource and a target string
     * accessibleDescription: A string to be used as a accessible description for the indicator. It renders an element only visible for screenreaders to provide additional context
     */
    indicators: {
      type: Array,
      required: true
    },
    target: {
      type: String,
      required: false,
      default: ''
    }
  },

  data() {
    return {
      accessibleDescriptionIds: {}
    }
  },

  methods: {
    hasHandler(indicator) {
      return Object.prototype.hasOwnProperty.call(indicator, 'handler')
    },
    getIndicatorDescriptionId(indicator) {
      if (!indicator.accessibleDescription) {
        return null
      }

      if (!this.accessibleDescriptionIds[indicator.id]) {
        this.accessibleDescriptionIds[indicator.id] = uniqueId('oc-indicator-description-')
      }

      return this.accessibleDescriptionIds[indicator.id]
    }
  }
}
</script>

<style lang="scss">
.oc-status-indicators {
  align-items: center;
  display: flex;
  justify-content: flex-end;
  &-indicator {
    border-radius: 50% !important;
  }
}
</style>

<docs>
```js
<template>
  <oc-status-indicators :resource="resource" :indicators="indicators" />
</template>
<script>
  export default {
    data: () => ({
      resource: {
        name: "Documents",
        path: "/"
      },
      indicators: [
        {
          id: 'files-sharing',
          label: "Shared with other people",
          icon: 'group',
          handler: (resource, indicatorId) => alert(`Resource: ${resource.name}, indicator: ${indicatorId}`)
        },
        {
          id: 'file-link',
          label: "Shared via link",
          icon: 'links',
          handler: (resource, indicatorId) => alert(`Resource: ${resource.name}, indicator: ${indicatorId}`)
        }
      ]
    }),
  }
</script>
```
</docs>
