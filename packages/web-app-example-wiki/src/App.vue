<template>
  <main id="wiki" class="uk-flex uk-height-1-1">
    <router-view />
  </main>
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
