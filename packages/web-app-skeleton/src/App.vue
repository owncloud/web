<template>
  <div @click="hello">CLICK ME TO TALK TO FOO --> {{ foo }}</div>
</template>

<script>
export default {
  data: () => ({
    foo: 'bar'
  }),
  methods: {
    hello() {
      alert(this.foo)
    }
  }
}
</script>
