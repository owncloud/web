<template>
  <v-text-field :label="label" append-icon="search" @input="onSearch" :value="searchQuery"></v-text-field>
</template>

<script>

export default {
  props: {
    value: {
      type: String,
      required: false,
      default: null
    },
    label: {
      type: String,
      required: false,
      default: ''
    }
  },
  data: () => ({
    query: ''
  }),
  methods: {
    onSearch (query) {
      this.query = query
      this.$emit('search', query)
    }
  },
  computed: {
    searchQuery () {
      // please don't treat empty string the same as null...
      return (this.value === null) ? this.query : this.value
    }
  }
}
</script>

<style>

</style>
