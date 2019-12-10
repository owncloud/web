<template>
  <div>
    <input ref="colorInput" type="text">
    <button @click="saveColor">Save</button>
    <div class="test-var" />
  </div>
</template>

<script>
export default {
  name: 'ThemeConfig',
  computed: {
    color () {
      return this.$refs.colorInput.value
    }
  },
  methods: {
    saveColor () {
      const css = `
      :root {
        --test-var: ${this.color};
      }
      `
      const head = document.head || document.getElementsByTagName('head')
      const style = document.createElement('style')

      head.appendChild(style)

      style.type = 'text/css'
      style.appendChild(document.createTextNode(css))
    }
  }
}
</script>

<style>
  .test-var {
    width: 150px;
    height: 150px;
    background-color: var(--test-var, #dedede) !important;
  }
</style>
