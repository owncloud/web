<template>
  <ul class="uk-nav uk-dropdown-nav uk-nav-default">
    <template v-for="(filter, fid) in fileFilter">
      <oc-filter-menu-item :key="fid" :name="filter.tag" :value="filter.value" @change="setFileFilter({ name: filter.name, value: !filter.value })">
        {{ fileFilterTranslations[filter.name] }}
      </oc-filter-menu-item>
    </template>
    <oc-filter-menu-item>
     <template v-slot:searchBar>
       <div class="uk-margin-small-top">
         <label>
           <translate>Name Filter</translate>
         </label>
       </div>
       <oc-search-bar :type-ahead="true" @search="setFilterTerm" :button="false" icon="" />
     </template>
   </oc-filter-menu-item>
  </ul>
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
