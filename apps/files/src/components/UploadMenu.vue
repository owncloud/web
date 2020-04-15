<template>
  <ul class="uk-list uk-list-divider uk-margin-remove-left uk-margin-remove-right">
    <li v-for="item in items" :key="item.id">
      <div class="uk-flex uk-flex-middle">
        <oc-icon name="file_copy" class="uk-margin-small-right" />
        <div class="uk-width-expand">
          <div class="uk-flex">
            <div class="uk-text-bold uk-width-expand uk-text-truncate">{{ item.name }}</div>
            <div class="uk-width-auto uk-text-nowrap">{{ item.size | fileSize }}</div>
          </div>
          <div class="uk-margin-remove uk-position-relative uk-width-expand">
            <oc-progress
              :aria-hidden="true"
              :max="100"
              :value="item.progress | toInt"
              class="uk-width-expand uk-margin-remove"
            />
            <span :aria-hidden="true" class="uk-position-center oc-progress-text">
              {{ item.progress | roundNumber }} %
            </span>
          </div>
        </div>
      </div>
    </li>
  </ul>
</template>
<script>
import Mixins from '../mixins'

export default {
  filters: {
    toInt(value) {
      return parseInt(value)
    }
  },
  mixins: [Mixins],
  props: {
    items: {
      type: Array,
      default: () => [],
      required: true
    }
  }
}
</script>
