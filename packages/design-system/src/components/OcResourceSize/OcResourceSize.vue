<template>
  <span class="oc-resource-size" v-text="formattedSize" />
</template>

<script>
import filesize from 'filesize'

/**
 * Displays a formatted resource size
 */
export default {
  name: 'OcResourceSize',
  status: 'ready',
  release: '2.1.0',
  props: {
    /**
     * Number of bytes to display as a reasonable resource size string.
     * Value can be a non-formatted string or a number.
     */
    size: {
      type: [String, Number],
      required: true
    }
  },

  computed: {
    formattedSize() {
      if (isNaN(this.size)) {
        return '?'
      }

      if (this.size < 0) {
        return '--'
      }

      const mb = 1048576

      return filesize(this.size, {
        round: this.size < mb ? 0 : 1,
        locale: (this.$language?.current || '').split('_')[0]
      })
    }
  }
}
</script>

<docs>
```js
<section>
  <h3 class="oc-heading-divider">
    A resource size passed as a number
  </h3>
  <oc-resource-size :size="234897" />
</section>
```
```js
<section>
  <h3 class="oc-heading-divider">
    A resource size passed as a string
  </h3>
  <oc-resource-size size="96001380" />
</section>
```
</docs>
