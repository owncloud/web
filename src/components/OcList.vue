<template>
  <div>
    <v-list :key="index" two-line v-for="(item, index) in data">
      <slot name="items" :item="item">
        <v-list-tile >
          <v-list-tile-title>
            {{ item }}
          </v-list-tile-title>
        </v-list-tile>
      </slot>
    </v-list>
  </div>
</template>
<script>
export default {
  props: {
    data: {
      required: true,
      type: Array
    }
  }
}
</script>
<style>
.oc-list-item {
  border: 2px black solid;
}
</style>
