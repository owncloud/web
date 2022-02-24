<template>
  <div class="space_info">
    <div class="space_info__body oc-text-overflow oc-flex oc-flex-middle">
      <div class="oc-mr-s">
        <oc-icon
          name="layout-grid"
          :size="space.description ? 'large' : 'medium'"
          class="oc-display-block"
        />
      </div>
      <div>
        <h3 data-testid="space-info-name" v-text="space.name" />
        <span data-testid="space-info-subtitle" v-text="space.description" />
      </div>
    </div>
  </div>
</template>

<script>
import Mixins from '../../mixins'

export default {
  name: 'SpaceInfo',
  mixins: [Mixins],
  inject: ['displayedItem'],
  computed: {
    space() {
      return this.displayedItem.value
    }
  }
}
</script>

<style lang="scss">
.space_info {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  grid-gap: 5px;

  &__body {
    text-align: left;
    font-size: 0.75rem;

    h3 {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0;
    }
  }
}
</style>
