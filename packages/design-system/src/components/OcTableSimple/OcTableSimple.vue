<template>
  <table :class="tableClasses">
    <slot />
  </table>
</template>
<script>
/**
 * A table component with manually built layout.
 */
export default {
  name: 'OcTableSimple',
  status: 'ready',
  release: '2.1.0',
  props: {
    /**
     * Whether or not table rows should be highlighted when hovered.
     */
    hover: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    tableClasses() {
      const result = ['oc-table-simple']
      if (this.hover) {
        result.push('oc-table-simple-hover')
      }
      return result
    }
  }
}
</script>
<style lang="scss">
@import '../../styles/styles';

.oc-table-simple {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;

  &-hover tr {
    transition: background-color $transition-duration-short ease-in-out;
  }

  tr + tr {
    border-top: 1px solid var(--oc-color-border);
  }

  &-hover tr:hover {
    background-color: var(--oc-color-input-border);
  }
}
</style>
<docs>
```js
<template>
  <section>
    <h3 class="oc-heading-divider">
      A simple table
    </h3>
    <oc-table-simple :hover="true">
      <oc-thead>
        <oc-tr>
          <oc-th>Resource</oc-th>
          <oc-th>Last modified</oc-th>
        </oc-tr>
      </oc-thead>
      <oc-tbody>
        <oc-tr v-for="item in items" :key="'item-' + item.id">
          <oc-td>{{ item.resource }}</oc-td>
          <oc-td>{{ item.last_modified }}</oc-td>
        </oc-tr>
      </oc-tbody>
    </oc-table-simple>
  </section>
</template>
<script>
  export default {
    computed: {
      items() {
        return [{
          id: "4b136c0a-5057-11eb-ac70-eba264112003",
          resource: "hello-world.txt",
          last_modified: 1609962211,
        }, {
          id: "8468c9f0-5057-11eb-924b-934c6fd827a2",
          resource: "I am a folder",
          last_modified: 1608887766,
        }, {
          id: "9c4cf97e-5057-11eb-8044-b3d5df9caa21",
          resource: "this is fine.png",
          last_modified: 1599999999,
        }]
      },
    },
  }
</script>
```
</docs>
