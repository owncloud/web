<template>
  <ul class="uk-list uk-margin-remove">
    <li v-for="(item, index) in items" :key="item.id">
      <div class="uk-flex">
        <oc-icon name="file_copy" class="uk-margin-small-right" />
        <div class="uk-width-expand">
          <div class="uk-text-bold" v-text="$_truncateFileName(item.name)" />
          <div class="uk-flex uk-flex-middle">
            <span class="uk-margin-small-right uk-text-nowrap">{{ item.size | fileSize }}</span>
            <oc-progress
              :value="item.progress | toInt"
              :max="100"
              class="uk-flex-1 uk-margin-remove"
            />
          </div>
        </div>
      </div>
      <template v-if="index !== items.length - 1">
        <hr class="uk-margin-bottom uk-margin-top" />
      </template>
    </li>
  </ul>
</template>
<script>
import Mixins from '../mixins'

export default {
  filters: {
    toInt (value) {
      return parseInt(value)
    }
  },
  mixins: [
    Mixins
  ],
  props: {
    items: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  methods: {
    $_truncateFileName (name) {
      if (name.length > 15) {
        return `${name.substr(0, 6)}...${name.substr(name.length - 6)}`
      }

      return name
    }
  }
}
</script>
