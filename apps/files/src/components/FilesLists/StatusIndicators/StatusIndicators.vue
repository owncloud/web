<template>
  <span>
    <DefaultIndicators
      v-if="displayDefaultIndicators"
      :item="item"
      :parentPath="parentPath"
      :class="{ 'uk-margin-xsmall-right' : customIndicators }"
      @click="openSidebar"
    />
    <template v-if="customIndicators">
      <component
        v-for="(indicator, index) in customIndicators"
        :is="indicator.component"
        :key="index"
      />
    </template>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'

const DefaultIndicators = () => import('./DefaultIndicators.vue')

export default {
  name: 'StatusIndicators',

  components: {
    DefaultIndicators
  },

  props: {
    // FIXME: Find a way to pass item into dynamic component as a prop without mutation error
    item: {
      type: Object,
      required: true
    },
    parentPath: {
      type: String,
      required: true
    }
  },

  computed: {
    ...mapGetters(['configuration', 'customFilesListIndicators']),

    displayDefaultIndicators () {
      return !this.configuration.theme.filesList.hideDefaultStatusIndicators
    },

    customIndicators () {
      return this.customFilesListIndicators
    }
  },

  methods: {
    // TODO: Adjust to send the event via store
    openSidebar (item, indicatorId) {
      this.$emit('click', item, indicatorId)
    }
  }
}
</script>
