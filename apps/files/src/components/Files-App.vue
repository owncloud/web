<template>
	<v-container id="files-app" fluid class="pa-0">
		<v-toolbar class="elevation-1">
	 			<v-btn v-if="!createFile" @click="createFolder ? addNewFolder(newFolderName) : createFolder = !createFolder" flat>
					<v-icon v-if="!createFolder" large>create_new_folder</v-icon>
					<v-icon v-if="createFolder" large>add</v-icon>
				</v-btn>
				<v-btn v-if="!createFolder" @click="createFile ? addNewFile(newFileName, item) : createFile = !createFile" flat>
					<v-icon v-if="!createFile" large>file_copy</v-icon>
					<v-icon v-if="createFile" large>add</v-icon>
				</v-btn>
			<v-flex v-if="createFolder || createFile" xs2>
				<v-text-field
					v-if="createFolder"
					@keydown.enter="addNewFolder(newFolderName)"
					:placeholder="$gettext('Enter foldername here')"
					v-model="newFolderName"
					hide-details
					single-line
				></v-text-field>
				<v-text-field
					v-if="createFile"
					@keydown.enter="addNewFile(newFileName)"
					:placeholder="$gettext('Enter filename here')"
					v-model="newFileName"
					hide-details
					single-line
				></v-text-field>
			</v-flex>
			<v-flex align-self-center>
				<v-breadcrumbs class="pa-0" :items="getRoutes">
					<template slot="item" slot-scope="props">
							<drop >
								<v-icon @click="navigateTo('files-list', props.item.route)" v-if="props.item.text === 'home'" large>
									home
								</v-icon>
								<span @click="navigateTo('files-list', props.item.route)" v-else class="heading font-weight-bold">
									{{ props.item.text }}
								</span>
							</drop>
					</template>
				</v-breadcrumbs>
			</v-flex>
			<v-flex align-self-center class="text-xs-right" xs1>
				<span>
					<translate :translate-n="filteredFiles.length" translate-plural="%{ filteredFiles.length } Results">
						%{ filteredFiles.length } Result
					</translate>
				</span>
			</v-flex>
			<v-menu transition="scale-transition">
				<v-btn slot="activator" flat><v-icon large>filter_list</v-icon></v-btn>
				<v-list>
					<v-list-tile v-for="(filter, fid) in filters" :key="fid" @click="">
						<v-list-tile-title v-text="filter.name"></v-list-tile-title>
						<v-checkbox v-model="filter.value"></v-checkbox>
					</v-list-tile>
				</v-list>
			</v-menu>
		</v-toolbar>
		<v-layout row>
			<v-flex xs12>
			<v-data-table
				id="filesTable"
				v-model="selected"
				:headers="headers"
				:items="filteredFiles"
				:pagination.sync="pagination"
				select-all
				item-key="name"
				class="elevation-1">
				<template slot="headers" slot-scope="props">
						<th>
							<v-checkbox
								:input-value="props.all"
								:indeterminate="props.indeterminate"
								primary
								hide-details
								@click.native="toggleAll"
							></v-checkbox>
						</th>
						<th>
							<v-checkbox
							primary	hide-details
							color="yellow"
							on-icon="star" off-icon="star_border"></v-checkbox>
						</th>
						<th
							v-for="header in props.headers"
							:key="header.text"
							:class="[header.text === 'Name' ? 'text-xs-left' : 'text-xs-center' , 'column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
							@click="changeSort(header.value)"
						>
							<v-icon small>arrow_upward</v-icon>
							{{ header.text }}
						</th>
					</tr>
				</template>
				<template slot="items" slot-scope="props">
					<tr :active="props.selected">
							<td>
								<v-checkbox @change="toggleFileSelect(props.item)" :input-value="props.selected" primary	hide-details>
								</v-checkbox>
							</td>
							<td>
								<v-checkbox
								@change=""
								v-model="props.item.starred"
								primary	hide-details
								color="yellow"
								on-icon="star" off-icon="star_border" large></v-checkbox>
							</td>
							<td @click="props.item.extension === false ? navigateTo('files-list', props.item.path) : openFileActionBar(props.item)" class="text-xs-left">
								<v-icon>{{ (props.item.extension === false) ? 'folder' : 'cloud_download' }}</v-icon>
								{{ props.item.name }}
							</td>
							<td @click="props.item.extension === false ? navigateTo('files-list', props.item.path) : openFileActionBar(props.item)" class="text-xs-center">
								{{ props.item.size | fileSize }}
							</td>
							<td @click="props.item.extension === false ? navigateTo('files-list', props.item.path) : openFileActionBar(props.item)" class="text-xs-center">
								{{ props.item.mdate | formDateFromNow }}
							</td>
							<td @click="props.item.extension === false ? navigateTo('files-list', props.item.path) : openFileActionBar(props.item)" class="text-xs-center">
								{{ props.item.owner }}
							</td>
					</tr>
				</template>
				<template slot="pageText" slot-scope="props">
					<span>Item</span> {{ props.pageStart }} - {{ props.pageStop }} <span>of</span> {{ props.itemsLength }}
				</template>
			</v-data-table>
		</v-flex>
		<v-flex>
			<file-details v-if="selectedFiles !== false" :items="selectedFiles"/>
		</v-flex>
		</v-layout>
			<fileactions-tab :sheet="showActionBar" :file="fileAction" @close="showActionBar = !showActionBar"/>
</v-container>
</template>

<script>
	import Mixins       from '../mixins';
	import FileDetails from './File-Details.vue'
	import FileactionsTab from './FileactionsTab.vue'

	const _includes = require('lodash/includes');
	import { filter } from 'lodash'
	import { mapActions, mapGetters, mapState } from 'vuex'

	export default {
		mixins:[
			Mixins
		],
		components: {
			FileDetails,
			FileactionsTab
		},
		data() {
			return {
			showActionBar: false,
			createFolder: false,
			createFile: false,
			fileAction: {},
			fileName: '',
      pagination: {
				rowsPerPage: 20,
        sortBy: 'name'
      },
			selected: [],
			headers: [
				{ text: 'Name', value: 'name' },
				{ text: 'Size', value: 'size' },
				{ text: 'Date', value: 'date' },
				{ text: 'Owner', value: 'owner' }
			],
			loading : false,
			filters: [
				{
					name: 'Files',
					tag: 'file',
				  value: true
				},{
					name: 'Folders',
					tag: 'folder',
					value: true
				}, {
					name: 'Hidden',
					tag: 'hidden',
					value: false
				}
			],
			path    : [],
			breadcrumbs: 	[],
			files   : [],
			self    : {},
			newFolderName	: '',
			newFileName	: ''
		}
	},
	mounted () {
		this.getFolder();
	},
	methods: {
		...mapActions('Files',['resetFileSelection', 'addFileSelection', 'removeFileSelection','loadFiles']),
		...mapActions(['openFile']),
		trace() {
			console.info('trace', arguments)
		},

		toggleFileSelect(item) {
			if(_includes(this.selectedFiles, item)){
				this.removeFileSelection(item)
			}
			else{
				this.addFileSelection(item)
			}
		},

		toggleAll () {
			if (this.selected.length) {
				for(let item of this.selectedFiles){
					this.removeFileSelection(item)
				}
				this.selected = []
			}
			else {
				this.selected = this.filteredFiles.slice()
				for (let item of this.selected) {
					if(!_includes(this.selectedFiles, item)){
						this.addFileSelection(item)
					}
				}
			}
		},

		changeSort (column) {
			if (this.pagination.sortBy === column) {
				this.pagination.descending = !this.pagination.descending
			} else {
				this.pagination.sortBy = column
				this.pagination.descending = false
			}
		},

		navigateTo (route , param) {
       this.$router.push({
         'name': route,
				 'params': {
					 'item': param
				 }
       })
    },
		openFileActionBar (file) {
			this.showActionBar = true
			console.log('Files-App#openFileActionBar', file.path)
			this.openFile({
				client: this.$client,
				filePath: file.path
			})
			this.fileAction = file
		},

		addNewFile (fileName, path) {
			this.createFile = !this.createFile
			if(fileName !== ''){
				if(path === 'home'){
					path = '/'
				}
				console.log('addNewFile', fileName, 'pathToAddto', path)
				// this.$client.files.putFile().then(res => {
				// 		console.log(res)
				// }).catch(console.info)
			}

		},

		addNewFolder (folderName){
			this.createFolder = !this.createFolder
			if(folderName !== ''){
				this.createFolder = !this.createFolder
				this.$client.files.createFolder(((this.item === 'home') ? '' : this.item) + '/' + folderName)
				.then(() => {
					this.getFolder();
					this.newFolderName = '';
				})
				.catch(console.error)
			}
		},

		ifFiltered(item) {
				for(let filter of this.filters) {
					if(item.type === filter.tag){
						return filter.value
					}
					else if(item.name.startsWith('.')) {
						return this.filters[2].value
					}
				}
		},

		getFileSize(file) {
			if (file.type === 'dir') {
				return file['fileInfo']['{DAV:}quota-used-bytes'] / 100
			} else {
				return file['fileInfo']['{DAV:}getcontentlength'] / 100
			}
		},

		getFolder () {
			if (!this.iAmActive){
				return false
			}
			this.path = []
			let absolutePath = this.$route.params.item === 'home' ? '/' : this.route.params.item
			this.$client.files.list(absolutePath, 1, [
			    '{http://owncloud.org/ns}favorite',
				'{DAV:}getcontentlength',
				'{http://owncloud.org/ns}size',
				'{DAV:}getlastmodified',
                '{DAV:}resourcetype'
			]).then(res => {

				this.files = res.splice(1).map(file => {
					return ({
						type    : (file.type === 'dir') ? 'folder' : file.type,
						starred : file['fileInfo']['{http://owncloud.org/ns}favorite'] !== '0',
						mdate   : file['fileInfo']['{DAV:}getlastmodified'],
						cdate   : '',    // TODO: Retrieve data of creation of a file
						size    : function () {
						if (file.type === 'dir') {
							return file['fileInfo']['{http://owncloud.org/ns}size'] / 100
						} else {
							return file['fileInfo']['{DAV:}getcontentlength'] / 100
						}
					}(),
						extension: (file.type === 'dir') ? false : '',
						name    : function () {
							let pathList = file.name.split("/").filter(e => e !== "")
							return pathList[pathList.length - 1];
						}(),
						path    : file.name,
						id      : file['fileInfo']['{DAV:}getetag']
					})
				});

				this.loadFiles(this.files);

				this.self = files.self;

				this.resetFileSelection();
			})
		}
	},

	watch: {
		item () {
			this.getFolder();
		}
	},

	computed: {
		...mapState(['route']),
		...mapGetters('Files', ['selectedFiles']),

			filteredFiles() {
			return filter(this.files, (file) => {
				return this.ifFiltered(file)
			})
		},

		getRoutes() {
			this.breadcrumbs = [];
			let breadcrumb = {};
			let absolutePath = this.route.params.item;
			let pathSplit  = absolutePath.split('/').filter((val) => val);
			if(!_includes(pathSplit, 'home')){
					breadcrumb.text = 'home'
					breadcrumb.route = breadcrumb.text
					this.breadcrumbs.push(breadcrumb);
					breadcrumb = {}
			}
				for (let i = 0; i < pathSplit.length; i++) {
					breadcrumb.text = pathSplit.slice(0, i + 1)[i]
					breadcrumb.route = '/' + pathSplit.slice(0, i + 1).join('/')
					this.breadcrumbs.push(breadcrumb);
					breadcrumb = {}
				}
			return this.breadcrumbs
		},

		item() {
			return this.$route.params.item;
		},

		iAmActive () {
			return this.$route.name === 'files-list';
		}
	}
}
</script>
