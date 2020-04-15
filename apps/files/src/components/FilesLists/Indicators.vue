<template>
  <span>
    <div
      v-if="displayDefaultIndicators"
      :class="{ 'uk-margin-xsmall-right': customIndicators }"
      @click="openSidebar"
    >
      <oc-button
        v-for="(indicator, index) in defaultIndicators"
        :key="index"
        class="file-row-share-indicator uk-text-middle"
        :class="{ 'uk-margin-xsmall-left': index > 0, 'uk-invisible': !indicator.visible }"
        :aria-label="indicator.label"
        variation="raw"
        @click="indicator.handler(item, indicator.id)"
      >
        <oc-icon
          :name="indicator.icon"
          class="uk-text-middle"
          size="small"
          :variation="indicator.status"
        />
      </oc-button>
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
  },

  methods: {
    // TODO: Adjust to send the event via store
    openSidebar(item, indicatorId) {
      this.$emit('click', item, indicatorId)
    }
  }
}
</script>
