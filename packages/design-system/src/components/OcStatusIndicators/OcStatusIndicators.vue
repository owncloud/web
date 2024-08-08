<template>
  <div class="oc-status-indicators">
    <template v-for="indicator in indicators">
      <oc-button
        v-if="hasHandler(indicator) && !disableHandler"
        :id="indicator.id"
        :key="`${indicator.id}-handler`"
        v-oc-tooltip="$gettext(indicator.label)"
        class="oc-status-indicators-indicator oc-ml-xs"
        :aria-label="$gettext(indicator.label)"
        :aria-describedby="getIndicatorDescriptionId(indicator)"
        appearance="raw"
        :data-testid="indicator.id"
        :data-test-indicator-type="indicator.type"
        @click="indicator.handler(resource)"
      >
        <oc-icon
          :name="indicator.icon"
          size="small"
          :fill-type="indicator.fillType"
          variation="inherit"
        />
      </oc-button>
      <oc-icon
        v-else
        :id="indicator.id"
        :key="indicator.id"
        v-oc-tooltip="$gettext(indicator.label)"
        tabindex="-1"
        size="small"
        class="oc-status-indicators-indicator oc-ml-xs"
        :name="indicator.icon"
        :fill-type="indicator.fillType"
        :accessible-label="$gettext(indicator.label)"
        :aria-describedby="getIndicatorDescriptionId(indicator)"
        :data-testid="indicator.id"
        :data-test-indicator-type="indicator.type"
      />
      <p
        v-if="getIndicatorDescriptionId(indicator)"
        :id="getIndicatorDescriptionId(indicator)"
        :key="getIndicatorDescriptionId(indicator)"
        class="oc-invisible-sr"
        v-text="$gettext(indicator.accessibleDescription)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, unref } from 'vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import OcButton from '../OcButton/OcButton.vue'
import uniqueId from '../../utils/uniqueId'

type Indicator = {
  id: string
  icon: string
  label: string
  handler?: any
  accessibleDescription?: string
  visible?: boolean
  type?: string
  fillType?: string
}

/**
 * Status indicators which can be attatched to a resource
 */
export default defineComponent({
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
     * handler: An action to be triggered when the indicator is clicked. Receives the resource.
     * accessibleDescription: A string to be used as a accessible description for the indicator. It renders an element only visible for screenreaders to provide additional context
     */
    indicators: {
      type: Array as PropType<Indicator[]>,
      required: true
    },
    /**
     * Disables the handler for all indicators. This is useful e.g. for disabled resources.
     */
    disableHandler: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    const accessibleDescriptionIds = ref({} as Record<string, string>)

    const hasHandler = (indicator: Indicator): boolean => {
      return Object.prototype.hasOwnProperty.call(indicator, 'handler')
    }

    const getIndicatorDescriptionId = (indicator: Indicator): string | null => {
      if (!indicator.accessibleDescription) {
        return null
      }

      if (!unref(accessibleDescriptionIds)[indicator.id]) {
        unref(accessibleDescriptionIds)[indicator.id] = uniqueId('oc-indicator-description-')
      }

      return unref(accessibleDescriptionIds)[indicator.id]
    }

    return {
      accessibleDescriptionIds,
      hasHandler,
      getIndicatorDescriptionId
    }
  }
})
</script>

<style lang="scss">
.oc-status-indicators {
  align-items: center;
  display: flex;
  justify-content: flex-end;
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
