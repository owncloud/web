<template>
  <oc-drop toggle="#oc-filter-list-btn" mode="click">
    <ul class="uk-list">
      <li v-for="(filter, fid) in fileFilter" :key="fid">
        <oc-checkbox :id="'oc-filter-' + filter.tag + '-checkbox'" :name="filter.tag" :value="filter.value" @change="setFileFilter({ name: filter.name, value: !filter.value })" />
        <label :id="'oc-filter-' + filter.tag + '-label'" :for="'oc-filter-' + filter.tag + '-checkbox'" class="uk-text-meta">
          {{ fileFilterTranslations[filter.name] }}
        </label>
      </li>
      <li>
        <label for="oc-filter-search" class="uk-text-meta" v-translate>
          Name Filter
        </label>
        <oc-search-bar id="oc-filter-search" small :type-ahead="true" @search="setFilterTerm" :button="false" />
      </li>
    </ul>
 </oc-drop>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
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
