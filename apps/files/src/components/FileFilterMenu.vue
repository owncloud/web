<template>
  <v-menu class="mt-2" transition="scale-transition">
    <v-btn slot="activator" flat @click="focusFilenameFilter"><v-icon large>filter_list</v-icon></v-btn>
    <v-list>
      <v-list-tile v-for="(filter, fid) in fileFilter" :key="fid">
        <v-list-tile-title v-text="fileFilterTranslations[filter.name]"></v-list-tile-title>
        <v-checkbox :input-value="filter.value" @change="setFileFilter({ name: filter.name, value: $event })"></v-checkbox>
      </v-list-tile>
      <v-list-tile>
        <v-list-tile-title>
          <span v-translate>Name</span>
        </v-list-tile-title>
        <search-bar @input="setFilterTerm" :value="filterTerm" ref="filenameFilter" autofocus :label="$gettext('Search')"/>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SearchBar from 'oc_components/form/SearchBar.vue'

export default {
  name: 'FileFilterMenu',
  data () {
    return {
      fileFilterTranslations: {
        'Files': this.$gettext('Files'),
        'Folders': this.$gettext('Folders'),
        'Hidden': this.$gettext('Hidden')
      }
    }
  },
  components: {
    SearchBar
  },
  methods: {
    ...mapActions('Files', ['setFileFilter', 'setFilterTerm']),
    focusFilenameFilter () {
      this.$refs.filenameFilter.$el.querySelector('input').focus()
      // nested vuetify VList animation will block native autofocus, so we use this workaround...
      setTimeout(() => {
        // ...to set focus after the element is rendered visible
        this.$refs.filenameFilter.$el.querySelector('input').focus()
      }, 50)
    }
  },
  computed: {
    ...mapGetters('Files', ['fileFilter', 'filterTerm'])
  }
}
</script>
