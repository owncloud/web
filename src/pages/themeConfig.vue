<template>
  <div class="uk-padding">
    <h2>Change color of top bar</h2>
    <input
      ref="colorInput"
      type="color"
      :value="color"
      class="uk-margin-small-bottom color-input"
    >
    <oc-button variation="primary" @click="saveColor">Save</oc-button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ThemeConfig',
  computed: {
    ...mapGetters(['configuration']),
    color () {
      if (this.configuration.theme.colors) {
        return this.configuration.theme.colors.primaryBackground
      }

      return null
    }
  },
  methods: {
    saveColor () {
      const css = `
      :root {
        --primary-background: ${this.$refs.colorInput.value};
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

<style scoped>
  .color-input {
    display: block;
    width: 100px;
    height: 100px;
  }
</style>
