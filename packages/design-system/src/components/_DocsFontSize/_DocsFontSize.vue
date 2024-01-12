<template>
  <div class="font-sizes">
    <div
      v-for="(prop, index) in tokens"
      :key="index"
      class="font"
      :style="{ fontSize: prop.value }"
    >
      ${{ prop.name }}, var(--{{ prop.name }})
      <span>({{ prop.value }})</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import designTokens from '../../assets/tokens/ods.json'

/**
 * This typographic scale makes it easier to achieve visual harmony in the
 * interface. It’s purposefully designed to keep the number of separate font
 * sizes to a minimum. To edit font-sizes, see
 * [/src/tokens/font-size.yml](https://github.com/owncloud/web/blob/master/packages/design-system/src/tokens/font-size.yml).
 */
export default defineComponent({
  name: 'DocsFontSize',

  computed: {
    tokens() {
      return Object.values(designTokens).filter((token) => token.name.startsWith('oc-font-size-'))
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../../../docs/docs.tokens';

/* STYLES
--------------------------------------------- */

.font-sizes {
  margin-top: $space-l;
  overflow: hidden;
  width: 100%;
}
.font {
  @include reset;
  font-family: $font-heading;
  font-weight: $weight-bold;
  line-height: $line-height-xs;
  color: $color-rich-black;
  margin-bottom: $space-s;
  font-style: normal;
  span {
    letter-spacing: -0.02em;
    margin-left: 10px;
    font-weight: $weight-normal;
    color: $color-silver;
    user-select: none;
    font-style: normal;
  }
}
</style>

<docs>
  ```
  <DocsFontSize/>
  ```
</docs>
