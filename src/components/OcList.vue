<template>
  <div class="list-container">
    <v-list class="list" two-line>
      <div v-for="(item, index) in data" :key="index">
        <slot name="items" :item="item">
          <v-list-tile >
            <v-list-tile-title>
              {{ item }}
            </v-list-tile-title>
          </v-list-tile>
        </slot>
      </div>
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
<style scoped>
.list {
  max-height: 46em;
  overflow-y: scroll;
}
</style>
