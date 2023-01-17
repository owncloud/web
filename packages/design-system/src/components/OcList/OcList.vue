<template>
  <ul class="oc-list oc-my-rm oc-mx-rm" :class="{ 'oc-list-raw': raw }">
    <slot />
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'OcList',
  status: 'ready',
  release: '12.0.0',
  props: {
    raw: {
      type: Boolean,
      default: false,
      required: false
    }
  }
})
</script>

<style lang="scss">
.oc-list {
  list-style: none;
  margin: 0;
  padding: 0;

  &-divider > :nth-child(n + 2) {
    border-top: 1px solid var(--oc-color-border);
    margin-top: var(--oc-space-small);
    padding-top: var(--oc-space-small);
  }
  &-raw {
    list-style-type: none;
    a {
      text-decoration: none !important;
      &:hover {
        color: inherit;
      }
    }
  }
}
</style>

<docs>
```js
<h3>Example list</h3>
<oc-list>
  <li>
      <oc-icon name="user" fill-type="line" />
      <a href="https://google.de">
        Profile
      </a>
  </li>
  <li>
      <oc-icon name="link" fill-type="line" />
      <a href="https://google.de">
        Links
      </a>
  </li>
  <li>
      <oc-icon name="file" fill-type="line" />
      <a href="https://google.de">
        Dateien
      </a>
  </li>
</oc-list>
```
</docs>
