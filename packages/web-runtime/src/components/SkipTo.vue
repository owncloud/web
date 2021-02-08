<template>
  <button class="skip-button" @click="skipToTarget"><slot></slot></button>
</template>

<script>
export default {
  props: {
    /*
     * The element to focus and to skip to
     */
    target: {
      type: String,
      required: true
    }
  },
  computed: {
    targetElement() {
      return document.getElementById(this.target)
    }
  },
  methods: {
    skipToTarget() {
      // Make targetElement programmatically focusable
      this.targetElement.setAttribute('tabindex', '-1')

      // Focus and scroll into view
      this.targetElement.focus()
      this.targetElement.scrollIntoView()
    }
  }
}
</script>

<style scoped>
.skip-button {
  position: absolute;
  top: -100px;
  left: 0;
  z-index: 1;
  -webkit-appearance: none;
  border: none;
  background-color: #ffffff;
  font: inherit;
  padding: 0.25em 0.5em;
}

.skip-button:focus {
  top: 0;
  outline: none;
}
</style>
