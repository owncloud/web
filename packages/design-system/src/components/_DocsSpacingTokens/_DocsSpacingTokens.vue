<template>
  <div class="spacing">
    <div
      v-for="(prop, index) in tokens"
      :key="index"
      class="space"
      :style="{ lineHeight: prop.value, height: prop.value }"
    >
      ${{ prop.name.replace(/_/g, '-') }}
      <span>({{ prop.value }})</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import designTokens from '../../assets/tokens/ods.json'

/**
 * A framework for creating a predictable and harmonious spacing system. These
 * tokens are used for padding, margins, and position together with
 * [spacing utilities](https://github.com/owncloud/owncloud-design-system/wiki/spacing).
 * To edit spacing, see
 * [/src/tokens/spacing.yml](https://github.com/owncloud/web/blob/master/packages/design-system/src/tokens/spacing.yml).
 */
export default defineComponent({
  name: 'DocsSpacingTokens',
  computed: {
    tokens() {
      return Object.values(designTokens).filter((token) => token.name.startsWith('oc-space'))
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../../../docs/docs.tokens';

/* STYLES
--------------------------------------------- */

.spacing {
  margin-top: $space-l;
  overflow: hidden;
  max-width: 1176px;
  width: 100%;
}
.space {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  border-radius: $radius-default;
  box-shadow: $shadow-s-inset;
  margin-bottom: $space-xs;
  font-size: $size-s;
  font-family: $font-text;
  color: $color-rich-black;
  background: tint(#c4cdd5, 85%);
  text-align: center;
  position: relative;
  float: left;
  width: 100%;
  span {
    margin-left: 5px;
    color: $color-silver;
    user-select: none;
    font-style: normal;
  }
}
</style>

<docs>
  ```jsx
  <docs-spacing-tokens />
  ```
</docs>
