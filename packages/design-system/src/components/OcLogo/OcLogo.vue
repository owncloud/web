<template>
  <oc-img class="oc-logo" :src="src" :alt="alt" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import OcImg from '../OcImage/OcImage.vue'

export default defineComponent({
  name: 'OcLogo',
  status: 'ready',
  release: '7.3.0',
  components: { OcImg },

  props: {
    /**
     * Location of the logo image
     */
    src: {
      type: String,
      required: true
    },
    /**
     * Alternative text of the logo image
     */
    alt: {
      type: String,
      required: true
    }
  }
})
</script>

<style lang="scss">
.oc-logo {
  max-width: var(--oc-size-max-width-logo);
  max-height: var(--oc-size-max-height-logo);
  margin: var(--oc-space-small);
}
</style>

<docs>
```js
<oc-logo src="examples/placeholder_brand_logo.svg" alt="ownCloud" />
```
</docs>
