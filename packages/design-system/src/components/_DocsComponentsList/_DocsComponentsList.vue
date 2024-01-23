<template>
  <div data-testid="components-list" class="component-status">
    <ul class="status-list">
      <li>
        <oc-icon name="checkbox-circle" variation="success" />
        <p>{{ $gettext('Ready') }}</p>
      </li>
      <li>
        <oc-icon name="todo" variation="warning" />
        <p>{{ $gettext('Under review') }}</p>
      </li>
      <li>
        <oc-icon name="alert" variation="danger" />
        <p>{{ $gettext('Deprecated') }}</p>
      </li>
      <li>
        <oc-icon name="code-box" />
        <p>{{ $gettext('Prototype') }}</p>
      </li>
      <li>
        <span>—</span>
        <p>{{ $gettext('Not applicable') }}</p>
      </li>
    </ul>
    <table>
      <caption class="oc-invisible-sr">
        {{
          $gettext('A list of all components defined in the design system')
        }}
      </caption>
      <thead>
        <tr>
          <th>{{ $gettext('Component Name') }}</th>
          <th>{{ $gettext('Released in') }}</th>
          <th>{{ $gettext('Status') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(component, index) in components"
          :key="index"
          class="component"
          data-testid="component-list-row"
        >
          <td v-if="component.name">
            <a :href="`/#/oC%20Components/${component.name}`">
              <code class="name">{{ component.name }}</code>
            </a>
          </td>
          <td v-else>N/A</td>
          <td v-if="component.release">
            {{ component.release }}
          </td>
          <td v-else>N/A</td>
          <td v-if="component.status">
            <oc-icon
              v-if="component.status === 'ready'"
              name="checkbox-circle"
              variation="success"
            />
            <oc-icon
              v-if="component.status === 'under-review' || component.status === 'review'"
              name="todo"
              variation="warning"
            />
            <oc-icon v-if="component.status === 'prototype'" name="code-box" variation="passive" />
            <oc-icon v-if="component.status === 'deprecated'" name="alert" variation="danger" />
          </td>
          <td v-else>—</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import orderBy from '../../../docs/utils/orderBy'

export default defineComponent({
  name: 'DocsComponentsList',
  data() {
    return {
      components: this.orderData(this.getComponents())
    }
  },
  methods: {
    getComponents: function () {
      const components = []
      const contexts = [(require as any).context('@/components/', true, /\.vue$/)]

      contexts.forEach((context) => {
        context.keys().forEach((key) => components.push(context(key).default))
      })

      return components.map((c) => {
        return c
      })
    },
    orderData: function (data) {
      return orderBy(data, 'name', 'asc')
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../../../docs/docs.tokens';

/* STYLES
--------------------------------------------- */
.component-status {
  @include reset;
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
    padding: $space-s;
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
    font-size: $size-m;
    padding: $space-s;
    &:first-child {
      font-weight: $weight-bold;
      white-space: nowrap;
    }
  }
  .status-list {
    margin: 0 0 $space-m;
    overflow: hidden;
    padding: 0;
    list-style: none;
    flex-direction: row;
    align-items: center;
    display: flex;
    @media (max-width: 1000px) {
      display: block;
    }
    li {
      margin: 0 $space-m 0 0;
      color: $color-silver;
      font-size: $size-s;
      align-items: center;
      display: flex;
      @media (max-width: 1000px) {
        width: 50%;
        float: left;
        margin: 0;
      }
      svg,
      span {
        margin: -2px calc(#{$space-s} / 2) 0 0;
      }
      p {
        @media (max-width: 1000px) {
          margin: $space-xs;
        }
      }
    }
  }
}
</style>

<docs>
  ```jsx
  <docs-components-list />
  ```
</docs>
