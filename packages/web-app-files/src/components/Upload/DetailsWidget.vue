<template>
  <ul class="oc-list oc-list-divider oc-ml-rm oc-mr-rm">
    <li v-for="item in items" :key="item.id">
      <div class="oc-flex oc-flex-middle">
        <oc-icon name="file-copy2" class="oc-mr-s" />
        <div class="oc-width-expand">
          <div class="oc-flex">
            <div class="oc-text-bold oc-width-expand oc-text-truncate upload-details-item-name">
              {{ item.name }}
            </div>
            <div class="oc-width-auto oc-text-nowrap upload-details-item-size">
              {{ getResourceSize(item.size) }}
            </div>
          </div>
          <div class="oc-m-rm oc-position-relative oc-width-expand">
            <oc-progress
              :aria-hidden="true"
              :max="100"
              :value="item.progress | toInt"
              class="oc-width-expand oc-m-rm"
            />
            <span :aria-hidden="true" class="oc-position-center oc-progress-text">
              {{ item.progress | roundNumber }} %
            </span>
          </div>
        </div>
      </div>
    </li>
  </ul>
</template>
<script>
import Mixins from '../../mixins'
import MixinResources from '../../mixins/resources'

export default {
  filters: {
    toInt(value) {
      return parseInt(value)
    }
  },
  mixins: [Mixins, MixinResources],
  props: {
    items: {
      type: Array,
      default: () => [],
      required: true
    }
  }
}
</script>
