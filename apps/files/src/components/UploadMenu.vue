<template>
  <ul class="uk-list uk-margin-remove">
    <li v-if="items.length > 2">{{ headline }}</li>
    <li v-for="(item, index) in items" :key="index">
      <div class="uk-flex">
        <oc-icon name="file_copy" class="uk-margin-small-right uk-flex-none" />
        <div class="uk-flex-1">
          <span class="uk-text-bold">{{ item.name }}</span>
          <div class="uk-flex uk-flex-middle">
            <span class="uk-flex-2 uk-margin-small-right">{{ item.size | fileSize }}</span>
            <oc-progress
              color="primary"
              :value="item.progress | toInt"
              :max="100"
              class="uk-flex-1 uk-margin-remove"
            ></oc-progress>
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
  filters: {
    toInt (int) {
      return parseInt(int)
    }
  },
  computed: {
    headline () {
      const translated = this.$gettext('%{number} items to upload remaining…')
      return this.$gettextInterpolate(translated, { number: this.items.length }, true)
    }
  }
}
</script>
