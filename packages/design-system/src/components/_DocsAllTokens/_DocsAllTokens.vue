<template>
  <div class="all-tokens">
    <table>
      <caption class="oc-invisible-sr">
        {{
          $gettext('A list of all defined design tokens')
        }}
      </caption>
      <thead>
        <tr>
          <th>{{ $gettext('Token Name') }}</th>
          <th>{{ $gettext('Value') }}</th>
          <th>{{ $gettext('Category') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(token, index) in tokens" :key="index" class="token">
          <td v-if="token.name">
            <code class="name">${{ token.name.replace(/_/g, '-') }}</code>
          </td>
          <td v-else>N/A</td>
          <td v-if="token.value">
            <div
              v-if="token.name.startsWith('oc-color')"
              class="example color"
              :style="{ backgroundColor: token.value }"
            />
            <code class="type">{{ token.value }} </code>
          </td>
          <td v-else>N/A</td>
          <td v-if="token.category">
            {{ token.category }}
          </td>
          <td v-else>N/A</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import designTokens from '../../assets/tokens/ods.json'

/**
 * A list of available tokens in ownCloud Design System. Use these tokens in place
 * of hard-coded values in order to maintain a scalable and consistent system.
 * To edit these tokens and add more, see
 * [/src/tokens/](https://github.com/owncloud/owncloud-design-system/blob/master/src/tokens).
 */
export default defineComponent({
  name: 'DocsAllTokens',
  data() {
    return {
      tokens: Object.values(designTokens)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../../../docs/docs.tokens';

/* STYLES
--------------------------------------------- */

.all-tokens {
  @include reset;
  margin-top: $space-l;
  font-family: $font-heading;
  font-weight: $weight-normal;
  line-height: $line-height-xs;
  color: $color-rich-black;
  margin-bottom: $space-s;
  font-style: normal;
  @media (max-width: 1000px) {
    overflow-x: auto;
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
  }
  thead th {
    padding: $space-s $space-l $space-s $space-s;
    background: $color-cloud;
    font-size: $size-s;
    color: $color-oxford-blue;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: $weight-semi-bold;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: left;
    // Chrome has a bug related to thead, this only works on th:
    position: -webkit-sticky;
    position: sticky;
    top: -1px;
    &:first-child {
      border-top-left-radius: $radius-default;
      border-bottom-left-radius: $radius-default;
    }
    &:last-child {
      border-top-right-radius: $radius-default;
      border-bottom-right-radius: $radius-default;
    }
  }
  tr {
    border-bottom: 1px solid #dfe3e6;
    &:last-child {
      border: 0;
    }
  }
  td {
    font-size: $size-s;
    padding: $space-s $space-l $space-s $space-s;
    &:first-child {
      font-weight: $weight-bold;
      white-space: nowrap;
    }
  }
  .type {
    line-height: $line-height-s;
    max-width: calc(100% - #{$space-m});
    float: left;
  }
  .example {
    @include inline-space($space-xs);
    border-radius: $radius-default;
    background: $color-white;
    box-shadow: $shadow-s-inset, $shadow-s-inset, $shadow-s-inset;
    margin-top: $space-xx-small;
    width: $space-s;
    height: $space-s;
    float: left;
  }
}
</style>

<docs>
  ```jsx
  <all-tokens />
  ```
</docs>
