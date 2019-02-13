<template>
    <v-layout v-if="selectedFiles.length <= 1" column>
        <v-layout row>
            <v-list-tile
                    v-for="tile in selectedFiles"
                    :key="tile.id"
            >
                <v-list-tile-avatar>
                    <v-icon large>folder</v-icon>
                </v-list-tile-avatar>

                <v-list-tile-title>{{ tile.name.substr(0, 20) }}...</v-list-tile-title>
                <v-list-tile-sub-title>{{ tile.size | fileSize }}</v-list-tile-sub-title>
            </v-list-tile>
        </v-layout>
    </v-layout>
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
        <v-layout column>
            <v-list-tile
                    v-for="tile in selectedFiles"
                    :key="tile.id"
            >
                <v-list-tile-avatar>
                    <v-icon large>folder</v-icon>
                </v-list-tile-avatar>

                <v-list-tile-title>{{ tile.name.substr(0, 20) }}...</v-list-tile-title>
                <v-list-tile-sub-title>{{ tile.size | fileSize }}</v-list-tile-sub-title>
            </v-list-tile>
        </v-layout>
    </v-layout>
</template>

<script>
import Mixins from '../mixins'
import { reduce } from 'lodash'
import { mapGetters } from 'vuex'

export default {
  mixins: [
    Mixins
  ],
  name: 'FileInfoSidebar',
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
