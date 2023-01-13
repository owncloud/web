<template>
  <div @click="hello">CLICK ME TO TALK TO FOO --> {{ foo }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  data: () => ({
    foo: 'bar'
  }),
  methods: {
    hello() {
      alert(this.foo)
    }
  }
})
</script>
