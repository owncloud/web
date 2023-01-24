<template>
  <div class="space_info">
    <div class="space_info__body oc-text-overflow oc-flex oc-flex-middle">
      <div class="oc-mr-s">
        <oc-icon
          name="layout-grid"
          :size="spaceResource.description ? 'large' : 'medium'"
          class="oc-display-block"
        />
      </div>
      <div>
        <h3 data-testid="space-info-name" v-text="spaceResource.name" />
        <span data-testid="space-info-subtitle" v-text="spaceResource.description" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { PropType } from 'vue'
import { SpaceResource } from 'web-client'

export default defineComponent({
  name: 'SpaceInfo',
  props: {
    spaceResource: {
      type: Object as PropType<SpaceResource>,
      required: false
    }
  }
})
</script>

<style lang="scss">
.space_info {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  grid-gap: 5px;
  background-color: var(--oc-color-background-default);
  padding: var(--oc-space-small) var(--oc-space-small) 0 var(--oc-space-small);

  &__body {
    text-align: left;
    font-size: var(--oc-font-size-small);

    h3 {
      font-size: var(--oc-font-size-medium);
      font-weight: 600;
      margin: 0;
    }
  }
}
</style>
