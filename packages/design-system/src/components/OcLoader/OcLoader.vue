<template>
  <div :class="['oc-loader', { 'oc-loader-flat': flat }]" :aria-label="ariaLabel" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Remote actions can take an undefined portion of time. The spinner gives feedback to the users about an actions being processed.
 */
export default defineComponent({
  name: 'OcLoader',
  status: 'ready',
  release: '1.0.0',
  props: {
    /**
     * Descriptive text to be read to screen-readers.
     */
    ariaLabel: {
      type: String,
      default: 'Loading'
    },
    /**
     * Removes border radius and shrinks the height. Defaults to false.
     */
    flat: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss">
.oc-loader {
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #f8f8f8;
  border: 0;
  border-radius: 500px;
  display: block;
  height: 15px;
  margin-top: 20px;
  margin-bottom: 20px;
  overflow: hidden;
  vertical-align: baseline;
  width: 100%;
  position: relative;

  &-flat {
    border-radius: 0 !important;
    height: 5px !important;
  }

  &::after {
    background: var(--oc-color-onSurfaceVariant);
    content: '';
    height: 100%;
    width: 0;
    display: block;
    position: absolute;

    animation: {
      duration: 1.4s;
      iteration-count: infinite;
      name: oc-loader;
    }
  }
}

@keyframes oc-loader {
  0% {
    left: 0;
    width: 0;
  }

  50% {
    left: 0;
    width: 66%;
  }

  100% {
    left: 100%;
    width: 10%;
  }
}
</style>

<docs>
```js
<h3 class="oc-heading-divider">
  Default style
</h3>
<div>
  <oc-loader />
</div>

<h3 class="oc-heading-divider">
  Flat style
</h3>
<div>
  <oc-loader :flat="true" />
</div>
```
</docs>
