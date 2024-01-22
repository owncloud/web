<template>
  <div class="colors">
    <div v-for="(prop, index) in tokens" :key="index" class="color" :class="prop.category">
      <div class="swatch" :style="{ backgroundColor: prop.value }" />
      <h4>{{ prop.name }}</h4>
      <span v-for="(v, k) in prop.info" :key="k">
        <em>{{ k }}:</em>
        {{ v }}
      </span>
      <span>
        <em>scss:</em>
        ${{ prop.name }}
      </span>
      <span>
        <em>css:</em>
        var(--{{ prop.name }})
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import designTokens from '../../assets/tokens/ods.json'

/**
 * The color palette comes with 5 different weights for each hue. These hues
 * should be used purposefully to communicate how things function in the
 * interface. Keep in mind that `vermilion` is only used in special cases
 * like destructive actions and error messages. To edit the colors, see
 * [/src/tokens/color.yml](https://github.com/owncloud/owncloud-design-system/blob/master/src/tokens/color.yml).
 */
export default defineComponent({
  name: 'DocsColorTokens',

  computed: {
    tokens() {
      return Object.values(designTokens).filter((token) => token.name.startsWith('oc-color-'))
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../../../docs/docs.tokens';

/* STYLES
--------------------------------------------- */

.colors {
  margin-top: $space-l;
  display: block;
  width: 100%;
  @supports (display: grid) {
    display: grid;
    max-width: 1200px;
    align-content: stretch;
    justify-content: left;
    grid-template-columns:
      calc(20% - #{$space-m})
      calc(20% - #{$space-m})
      calc(20% - #{$space-m})
      calc(20% - #{$space-m})
      calc(20% - #{$space-m});
    grid-column-gap: $space-m;
    @media (max-width: 1300px) {
      grid-template-columns:
        calc(25% - #{$space-m})
        calc(25% - #{$space-m})
        calc(25% - #{$space-m})
        calc(25% - #{$space-m});
    }
    @media (max-width: 1100px) {
      grid-template-columns:
        calc(33.333% - #{$space-m})
        calc(33.333% - #{$space-m})
        calc(33.333% - #{$space-m});
    }
    @media (max-width: 900px) {
      grid-template-columns:
        calc(50% - #{$space-m})
        calc(50% - #{$space-m});
    }
    @media (max-width: 400px) {
      grid-template-columns: 100%;
    }
  }
}

.swatch {
  @include stack-space($space-s);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  height: $space-xxl;
  margin-left: -#{$space-s};
  margin-top: -#{$space-s};
  width: calc(100% + #{$space-l});
  float: left;
}

h3 {
  @include reset;
  @include stack-space($space-xs);
  text-transform: capitalize;
  line-height: 1.2;
  width: 100%;
  float: left;
}

.color {
  @include reset;
  @include inset-space($space-s);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-bottom: $space-m;
  box-shadow:
    0 0 0 1px rgba(63, 63, 68, 0.05),
    0 1px 3px 0 rgba(63, 63, 68, 0.15);
  font-size: $size-s;
  font-family: $font-text;
  color: $color-rich-black;
  border-radius: $radius-default;
  overflow: hidden;
  text-align: left;
  @supports (display: grid) {
    width: 100%;
    float: left;
  }
  @media (max-width: 400px) {
    margin-bottom: $space-m;
  }

  &:hover {
    span {
      color: $color-rich-black;

      em {
        color: $color-silver;
      }
    }
  }

  span {
    margin-bottom: $space-xs;
    line-height: 1.3;
    color: $color-silver;
    font-size: $size-s;
    width: 100%;
    float: left;

    em {
      user-select: none;
      font-style: normal;
    }
  }
}
</style>

<docs>
```jsx
<docs-color-tokens />
```
</docs>
