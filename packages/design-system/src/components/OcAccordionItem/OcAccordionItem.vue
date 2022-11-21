<template>
  <div :id="id" class="oc-accordion-item">
    <component :is="'h' + headingLevel" :id="titleId" class="oc-accordion-title">
      <oc-button
        appearance="raw"
        justify-content="space-between"
        class="oc-text-left oc-width-1-1"
        :aria-expanded="expanded.toString()"
        :aria-controls="contentId"
        @click="toggleExpanded"
        @keydown.space="toggleExpanded"
        @keydown.enter="toggleExpanded"
      >
        <span class="oc-width-1-1">
          <span class="oc-flex oc-flex-middle">
            <oc-icon v-if="icon" :name="icon" class="oc-mr-s" />
            <span class="oc-width-expand oc-accordion-title-text" v-text="title" />
            <span class="oc-ml-xs oc-icon-l">
              <oc-icon
                name="arrow-drop-down"
                fill-type="line"
                class="oc-accordion-title-arrow-icon"
                :class="{ rotate: expanded }"
                size="large"
              />
            </span>
          </span>
          <span v-if="description" class="oc-accordion-description">
            <span v-if="icon" class="oc-icon-m oc-mr-s" />
            <span class="oc-text-muted">{{ description }}</span>
          </span>
        </span>
      </oc-button>
    </component>
    <div :id="contentId" class="oc-accordion-content" :aria-labelledby="titleId" role="region">
      <!-- @slot Content of the accordion item -->
      <slot v-if="expanded" />
    </div>
  </div>
</template>
<script>
import uniqueId from '../../utils/uniqueId'
import OcButton from '../OcButton/OcButton.vue'
import OcIcon from '../OcIcon/OcIcon.vue'

export default {
  name: 'OcAccordionItem',
  status: 'ready',
  release: '1.0.0',
  components: {
    OcButton,
    OcIcon
  },
  props: {
    /**
     * Icon to be displayed on the left side of the accordion title.
     */
    icon: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Title to be displayed.
     */
    title: {
      type: String,
      required: true
    },
    /**
     * Description of the accordion item to be displayed below the accordion title.
     */
    description: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Id of the accordion item. If not specified, a unique id will be generated.
     * If the expanded items are supposed to be controlled via `expandedIds` or `expandedId` on the
     * wrapping accordion element, the `id` must be provided.
     */
    id: {
      type: String,
      required: false,
      default: () => uniqueId('oc-accordion-id-')
    },
    /**
     * Id of the accordion title. If not specified, a unique id will be generated.
     */
    titleId: {
      type: String,
      required: false,
      default: () => uniqueId('oc-accordion-title-')
    },
    /**
     * Id of the content of the accordion item. If not specified, a unique id will be generated.
     */
    contentId: {
      type: String,
      required: false,
      default: () => uniqueId('oc-accordion-content-')
    },
    /**
     * Heading level of the accordion title. Defaults to 3 (i.e. `h3`).
     */
    headingLevel: {
      type: String,
      required: false,
      default: '3'
    }
  },
  data: () => ({
    expanded: false
  }),
  methods: {
    toggleExpanded() {
      if (this.expanded) {
        this.$parent.$emit('collapse', this.id)
      } else {
        this.$parent.$emit('expand', this.id)
      }
    }
  }
}
</script>
