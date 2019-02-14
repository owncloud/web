<template>
  <v-text-field :label="label" append-icon="search" :loading="loading"
    @input="onType" :value="searchQuery" autofocus="autofocus"
    @keydown.enter="onSearch" @click:append="onSearch">
  </v-text-field>
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
    // native autofocus
    autofocus: {
      type: Boolean,
      required: false,
      default: false
    },
    // search while typing
    autosearch: {
      type: Boolean,
      required: false,
      default: false
    },
    // do not automatically trim whitespaces around search term
    noTrim: {
      type: Boolean,
      required: false,
      default: false
    },
    loading: {
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
      // use input event to support model directive
      this.$emit('input', query)
      if (this.autosearch) this.onSearch(query)
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
