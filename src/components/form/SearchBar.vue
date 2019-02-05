<template>
  <v-text-field :label="label" append-icon="search"
    @input="onType" :value="searchQuery" autofocus="autofocus" @keydown.enter="onSearch"></v-text-field>
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
    },
    autofocus: {
      type: Boolean,
      required: false,
      default: false
    },
    noTrim: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: () => ({
    query: ''
  }),
  methods: {
    onSearch (query) {
      this.$emit('search', this.query)
    },
    onType (query) {
      this.query = (!this.noTrim) ? query.trim() : query
      this.$emit('type', this.query)
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
