<template>
    <div>
      <oc-list v-if="selectedFiles.length <= 1" :data="selectedFiles">
        <template slot="items" slot-scope="props">
            <v-list-tile avatar ripple>
              <v-list-tile-avatar>
                <v-icon large>folder</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-if="props.item.name.length > 20">{{ props.item.name.substr(0, 20) }}...</v-list-tile-title>
                <v-list-tile-title v-else>{{ props.item.name }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ props.item.size | fileSize }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
      </oc-list>
    <v-layout v-else column>
        <v-layout row>
            <v-flex>
                <span class="content text-xs-center">{{ selectedFiles.length }} Items selected.</span>
            </v-flex>
            <v-spacer />
            <v-flex>
                <span class="content text-xs-right">Total Size: {{ accumulatedFilesSize | fileSize }}</span>
            </v-flex>
        </v-layout>
        <oc-list :data="selectedFiles">
          <template slot="items" slot-scope="props">
              <v-list-tile avatar ripple>
                <v-list-tile-avatar>
                  <v-icon large>folder</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-if="props.item.name.length > 20">{{ props.item.name.substr(0, 20) }}...</v-list-tile-title>
                  <v-list-tile-title v-else>{{ props.item.name }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ props.item.size | fileSize }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
        </oc-list>
    </v-layout>
  </div>
</template>

<script>
import Mixins from '../mixins'
import OcList from 'oc_components/OcList.vue'
import { reduce } from 'lodash'
import { mapGetters } from 'vuex'

export default {
  mixins: [
    Mixins
  ],
  name: 'FileInfoSidebar',
  components: {
    OcList
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    accumulatedFilesSize () {
      return reduce(this.selectedFiles, (sum, n) => {
        return sum + n.size
      }, 0)
    }
  }

}
</script>
