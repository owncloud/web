<template>
  <div class="oc-dropzone">
    <!-- @slot Message inside of the dropzone -->
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'OcDropzone',
  status: 'ready',
  release: '0.0.1'
})
</script>

<style lang="scss">
.oc-dropzone {
  align-items: center;
  background-color: var(--oc-color-background);
  border: 1px dashed var(--oc-color-primaryContainer);
  color: var(--oc-color-onSurface);
  display: flex;
  font-size: 1.5rem;
  justify-content: center;
  line-height: 1.5;
  opacity: 0.9;
  padding: var(--oc-space-medium);
  text-align: center;

  * {
    pointer-events: none;
  }
}
</style>

<docs>
```js
  <oc-dropzone>
    Drag and drop to upload content into current folder
  </oc-dropzone>
```
</docs>
