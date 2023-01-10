export default {
  emits: ['beforeUnmount', 'mounted', 'updated'],
  mounted() {
    this.$nextTick(() => this.$emit('mounted', this, 'mounted'))
  },
  beforeUnmount() {
    this.$emit('beforeUnmount', this, 'beforeUnmount')
  },
  updated() {
    this.$nextTick(() => this.$emit('updated', this, 'updated'))
  }
}
