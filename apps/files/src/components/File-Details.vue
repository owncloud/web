<template>
	<v-navigation-drawer
      v-model="drawer"
    >
      <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-tile avatar>
            <v-list-tile-avatar>
              <img src="https://randomuser.me/api/portraits/men/85.jpg">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>John Leider</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>

      <v-list class="pt-0" dense>
        <v-divider></v-divider>

        <v-list-tile
          v-for="item in items"
          :key="item.title"
          @click=""
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
</template>

<script>
const _each = require('lodash/each');
const _size = require('lodash/size');
const _filter = require('lodash/filter');
const _unique = require('lodash/uniqueId');

import Mixins from '../mixins';
//import Buttonrow from './File-Details-Buttonrow.vue';

export default {
	mixins: [Mixins],
	data (){
		return {
			drawer: true,
			items: []
		}
	},
	components: {
		//Buttonrow
	},
	methods: {
		close() {
			this.$emit('reset');
		}
	},
	computed: {
		switcherId() {
			return _unique('uk-switcher-');
		},
		accumulatedFilesSize() {
			let size = 0;

			_each(this.files, (e) => {
				size = size + e.size;
			});

			return size;
		},
		extendButtonRow() {
			return _filter(this.$root.plugins, ['extend', "filesDetailsButtonRow"]);
		},
		file() {
			let filesSelected = this.$store.getters['files/SELECTED'];
			if (_size(filesSelected) !== 1)
				return false;

			return filesSelected[0];
		},
		files() {
			let filesSelected = this.$store.getters['files/SELECTED'];
			if (_size(filesSelected) === 1)
				return false;

			return filesSelected;
		}
	}
}
</script>
