<template>
	<v-navigation-drawer
      v-model="drawer"
			class="grey lighten-2"
			right
			floating
			permanent
			height="100%"
    >
		<v-layout column>
			<v-layout primary row>
			  <v-flex>
			    <v-icon color="white" class="pl-4" medium>folder</v-icon>
			  </v-flex>
			  <v-flex white--text align-self-center>
			    <span class="subheading" v-translate> {{ getTabName }} </span>
			  </v-flex>
			</v-layout>
			<v-layout primary row>
			  <v-btn flat><v-icon color="white" medium>delete</v-icon></v-btn>
			  <v-btn flat><v-icon color="white" medium>share</v-icon></v-btn>
				<v-btn v-if="items.length <= 1" flat><v-icon color="white" medium>cloud_download</v-icon></v-btn>
			  <v-btn disabled v-else flat><v-icon color="white" medium>archive</v-icon></v-btn>
			</v-layout>
			<v-tabs
			  v-model="active"
			  color="primary lighten-5"
			  dark
			  slider-color="yellow"
			>
			  <v-tab
			    v-for="tab of registeredTabs"
			    :key="tab.name"
			    ripple
			  >
			    {{ tab.name }}
			  </v-tab>
			  <v-tab-item
			    v-for="tab of registeredTabs"
			    :key="tab.name"
			  >
					<v-layout v-if="items.length <= 1" column>
						<v-layout row>
							<v-list-tile
								v-for="tile in items"
								:key="tile.id"
								@click=""
							>
								<v-list-tile-avatar>
									<v-icon large>folder</v-icon>
								</v-list-tile-avatar>

								<v-list-tile-title @click="">{{ tile.name }}</v-list-tile-title>
								<v-list-tile-sub-title>{{ tile.size | fileSize }}</v-list-tile-sub-title>
							</v-list-tile>
						</v-layout>
					</v-layout>
					<v-layout v-else column>
						<v-layout row>
							<v-flex>
								<span class="content text-xs-center">{{ items.length }} Items selected.</span>
							</v-flex>
							<v-spacer />
							<v-flex>
								<span class="content text-xs-right">Total Size: {{ accumulatedFilesSize | fileSize }}</span>
							</v-flex>
						</v-layout>
						<v-layout column>
							<v-list-tile
								v-for="tile in items"
								:key="tile.id"
								@click=""
							>
								<v-list-tile-avatar>
									<v-icon large>folder</v-icon>
								</v-list-tile-avatar>

								<v-list-tile-title @click="">{{ tile.name }}</v-list-tile-title>
								<v-list-tile-sub-title>{{ tile.size | fileSize }}</v-list-tile-sub-title>
							</v-list-tile>
						</v-layout>
					</v-layout>
			  </v-tab-item>
			</v-tabs>
		</v-layout>
    </v-navigation-drawer>
</template>

<script>
import Mixins from '../mixins';
import { reduce } from 'lodash';

export default {
	mixins: [Mixins],
	props: ['items'],
	name: 'FileDetails',
	components: {
	},
	data (){
		return {
			drawer: false,
			tabName: '',
			active: this.getLength,
			registeredTabs: [
				{
					app: 'files',
					name: 'Files',
					componentPath: 'OcSidebar.vue'
				}
			],
		}
	},
	components: {
	},
	methods: {
		close() {
			this.$emit('reset');
		},
		toggleFileSelect(item) {
			if(_includes(this.selectedFiles, item)){
				this.removeFileSelection(item)
			}
			else{
				this.addFileSelection(item)
			}
		},
		loadSidebarAddons () {
			for(let tab of this.registeredTabs) {
				let component = require('./' + tab.componentPath)
				let componentClass = Vue.extend(component)
				let instance = new componentClass()
				instance.$mount()
			}
		},

	},
	computed: {
		getLength () {
			return this.items.length

		},
		getTabName () {
			let n = (this.items.length > 1) ? 'Multiple Files' : this.items[0].name
			// this.tabName = n
			return n
		},
		toggle () {
			if(!this.items){
				return this.drawer = false
			}else{
				return this.drawer = true
			}
		},

		accumulatedFilesSize() {
			let size = reduce(this.items, (sum, n) => {
				return sum + n.size
			},0)
			return size
		}
	}
}
</script>
