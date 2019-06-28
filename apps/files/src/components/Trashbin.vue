<template>
  <oc-table middle divider class="oc-filelist" id="files-list" v-show="!loadingFolder">
    <oc-table-group>
      <oc-table-row>
        <oc-table-cell shrink type="head">
          <oc-checkbox class="uk-margin-small-left" />
        </oc-table-cell>
        <oc-table-cell type="head" class="uk-text-truncate" v-translate>Name</oc-table-cell>
        <oc-table-cell shrink type="head" class="uk-text-nowrap" v-translate>Deletion Time</oc-table-cell>
        <oc-table-cell shrink type="head" v-translate>Actions</oc-table-cell>
      </oc-table-row>
    </oc-table-group>
    <oc-table-group>
      <oc-table-row v-for="(item, index) in fileData" :key="index" class="file-row">
        <oc-table-cell>
          <oc-checkbox class="uk-margin-small-left" />
        </oc-table-cell>
        <oc-table-cell class="uk-text-truncate">
          <oc-file :name="item.name" :extension="item.extension" class="file-row-name"
                   :filename="item.name" />
        </oc-table-cell>
        <oc-table-cell class="uk-text-meta uk-text-nowrap">
          {{ formDateFromNow(item.deleteTimestamp) }}
        </oc-table-cell>
        <oc-table-cell class="uk-text-meta uk-text-nowrap">
          <oc-button><translate>Restore</translate></oc-button>
          <oc-button><translate>Delete</translate></oc-button>
        </oc-table-cell>
      </oc-table-row>
    </oc-table-group>
  </oc-table>
</template>
<script>
import Mixins from '../mixins'
import { mapGetters } from 'vuex'

export default {
  name: 'Trashbin',
  props: ['fileData'],

  mixins: [
    Mixins
  ],

  computed: {
    ...mapGetters('Files', ['loadingFolder'])
  }
}
</script>
