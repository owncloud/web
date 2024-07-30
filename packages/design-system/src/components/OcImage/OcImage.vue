<template>
  <img :src="src" :alt="alt" :aria-hidden="`${ariaHidden}`" :title="title" :loading="loadingType" />
</template>
<script lang="ts">
import { PropType } from 'vue'
import { defineComponent } from 'vue'

/**
 * Images can be displayed using this component.
 *
 */
export default defineComponent({
  name: 'OcImg',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * Image source, path to image
     *
     **/
    src: {
      required: true,
      type: String,
      default: null
    },
    /**
     * The alt-attribute of the image.
     */
    alt: {
      type: String,
      required: false,
      default: ''
    },
    /**
     * The title of the image. Displayed when hover.
     */
    title: {
      type: String,
      required: false,
      default: null
    },
    /**
     * Defines whether the image gets loaded immediately or once it comes near the user's viewport
     */
    loadingType: {
      type: String as PropType<'lazy' | 'eager'>,
      required: false,
      default: 'eager',
      validator: (value: string) => {
        return ['eager', 'lazy'].includes(value)
      }
    }
  },
  computed: {
    ariaHidden() {
      return this.alt.length === 0
    }
  }
})
</script>

<docs>
```js
<h3>Example image, with width set explicitly:</h3>
<oc-img width="200" height="300" src="https://picsum.photos/200/300/?random" title="I am random" alt="example image" />

<h3>Example grayschale image:</h3>
<oc-img src="https://picsum.photos/g/200/300" title="Grayscale" alt="example grayschale image" />

<h3>Example using a SVG file:</h3>
<oc-img width="100" src="icons/folder.svg" title="i am a folder" alt="folder icon" />
```
</docs>
