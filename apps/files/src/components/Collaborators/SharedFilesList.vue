<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../../mixins'

export default {
  name: 'SharedFilesList',
  mixins: [
    Mixins
  ],
  props: {
    /**
       * Array of active files
       */
    fileData: {
      type: Array,
      required: true,
      default: null
    }
  },
  computed: {
    ...mapGetters('Files', ['loadingFolder'])
  },
  mounted () {
    this.$_ocSharedFromMe_getFiles()
  },
  methods: {
    ...mapActions('Files', ['loadFolderSharedFromMe', 'setFilterTerm']),

    $_ocSharedFromMe_getFiles () {
      this.setFilterTerm('')
      this.loadFolderSharedFromMe({
        client: this.$client,
        $gettext: this.$gettext
      })
    }
  }
}
</script>

<template>
  <oc-table middle divider class="oc-filelist" id="shared-with-others-list" v-if="!loadingFolder">
    <oc-table-group>
      <oc-table-row>
        <oc-table-cell type="head" class="uk-text-truncate" v-translate>Name</oc-table-cell>
        <oc-table-cell shrink type="head" class="uk-text-nowrap" v-translate>Shared with</oc-table-cell>
        <oc-table-cell shrink type="head" class="uk-text-nowrap" v-translate>Share time</oc-table-cell>
      </oc-table-row>
    </oc-table-group>
    <oc-table-group>
      <oc-table-row v-for="(item, index) in fileData" :key="index" :class="_rowClasses(item)" @click="selectRow(item, $event)" :id="'file-row-' + item.id">
        <oc-table-cell class="uk-text-truncate">
          <oc-file :name="item.basename" :extension="item.extension" class="file-row-name uk-disabled"
            :filename="item.name" :icon="fileTypeIcon(item)" :key="item.path" />
        </oc-table-cell>
        <oc-table-cell class="uk-text-meta uk-text-nowrap">
          {{ item.sharedWith }} <translate v-if="item.shareType === 1">(group)</translate>
        </oc-table-cell>
        <oc-table-cell class="uk-text-meta uk-text-nowrap">
          {{ formDateFromNow(item.shareTime) }}
        </oc-table-cell>
      </oc-table-row>
    </oc-table-group>
  </oc-table>
</template>
