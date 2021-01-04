<template>
  <span>
    <div v-if="displayDefaultIndicators" :class="{ 'oc-mr-xs': customIndicators }" class="uk-flex">
      <template v-if="areIndicatorsClickable">
        <oc-button
          v-for="(indicator, index) in defaultIndicators"
          :key="index"
          class="file-row-share-indicator uk-text-middle"
          :class="{ 'oc-ml-xs': index > 0, 'uk-invisible': !indicator.visible }"
          :aria-label="indicator.label"
          :uk-tooltip="indicator.label"
          variation="raw"
          @click.stop="indicator.handler(item, indicator.id)"
        >
          <oc-icon :name="indicator.icon" class="uk-text-middle" variation="passive" />
        </oc-button>
      </template>
      <template v-else>
        <oc-icon
          v-for="(indicator, index) in defaultIndicators"
          :key="index"
          :name="indicator.icon"
          :aria-label="indicator.label"
          :uk-tooltip="indicator.label"
          class="uk-text-middle"
          variation="system"
        />
      </template>
    </div>
    <template v-if="customIndicators">
      <component
        :is="indicator.component"
        v-for="(indicator, index) in customIndicators"
        :key="index"
      />
    </template>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Indicators',

  props: {
    // FIXME: Find a way to pass item into dynamic component as a prop without mutation error
    item: {
      type: Object,
      required: true
    },
    defaultIndicators: {
      type: Array,
      required: true
    },
    areIndicatorsClickable: {
      type: Boolean,
      required: false,
      default: true
    }
  },

  computed: {
    ...mapGetters(['configuration', 'customFilesListIndicators']),

    displayDefaultIndicators() {
      return !this.configuration.theme.filesList.hideDefaultStatusIndicators
    },

    customIndicators() {
      return this.customFilesListIndicators
    }
  }
}
</script>
