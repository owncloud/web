<template>
	<v-navigation-drawer
      v-model="drawer"
			right
			floating
			permanent
			height="100%"
    >
			<v-tabs
	      v-model="active"
	      color="primary"
	      dark
	      slider-color="yellow"
	    >
	      <v-tab
	        v-for="item in items"
	        :key="item.name"
	        ripple
	      >
	        {{ item.name }}
	      </v-tab>
	      <v-tab-item
	        v-for="item in items"
	        :key="item.name"
	      >
					<v-flex>
						<p class="headline font-weight-medium text-xs-center">{{ item.name }}</p>
					</v-flex>
					<v-layout row>
						<p class="text-xs-left">FileSize: </p>
						<v-spacer />
						<p class="text-xs-right">{{ item.size | fileSize }}</p>
					</v-layout>
					<v-layout row>
						<p class="text-xs-left">Created: </p>
						<v-spacer />
						<p class="text-xs-right">{{ item.cdate | formDateFromNow }}</p>
					</v-layout>
					<v-layout row>
						<p class="text-xs-left">Last Edited: </p>
						<v-spacer />
						<p class="text-xs-right">{{ item.mdate | formDateFromNow }}</p>
					</v-layout>
	      </v-tab-item>
	    </v-tabs>
    </v-navigation-drawer>
</template>

<script>
import Mixins from '../mixins';
import { each } from 'lodash';

export default {
	mixins: [Mixins],
	props: ['items'],
	data (){
		return {
			drawer: false,
			active: this.getLength,
		}
	},
	components: {
	},
	methods: {
		close() {
			this.$emit('reset');
		}
	},
	computed: {
		getLength () {
			return this.items.length
		},

		toggle () {
			if(!this.items){
				return this.drawer = false
			}else{
				return this.drawer = true
			}
		},

		accumulatedFilesSize() {
			let size = 0;

			each(this.items, (e) => {
				size = size + e.size;
			});

			return size;
		}
	}
}
</script>
