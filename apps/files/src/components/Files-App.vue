<template>
	<v-container fluid class="pa-0">
		<v-toolbar class="elevation-1">
 			<v-btn v-if="!createFolder" @click="createFolder = !createFolder" flat><v-icon large>create_new_folder</v-icon></v-btn>
			<v-btn v-if="createFolder" @click="createFolder = !createFolder" flat><v-icon large>add</v-icon></v-btn>
			<v-flex v-if="createFolder" xs2>
				<v-text-field
					placeholder="New folder Name"
					hide-details
					single-line
				></v-text-field>
			</v-flex>
			<v-flex align-self-center>
				<v-breadcrumbs class="pa-0" :items="getRoutes">
					<template slot="item" slot-scope="props">
							<drop >
								<v-icon @click="navigateTo('file-list', props.item.route)" v-if="props.item.text === 'home'" large>home</v-icon>
								<span @click="navigateTo('file-list', props.item.route)" v-else class="heading font-weight-bold">{{ props.item.text }}</span>
							</drop>
					</template>
				</v-breadcrumbs>
			</v-flex>
			<v-spacer></v-spacer>
			<v-flex align-self-center class="text-xs-right" xs1>
					<span class="heading">{{ files.length }} Results</span>
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

		<v-data-table
			v-model="selected"
			:headers="headers"
			:items="files"
			:pagination.sync="pagination"
			select-all
			item-key="name"
			class="elevation-1">
			<template slot="headers" slot-scope="props">
				<tr>
					<th>
						<v-checkbox
							:input-value="props.all"
							:indeterminate="props.indeterminate"
							primary
							hide-details
							@click.native="toggleAll"
						></v-checkbox>
					</th>
					<th
						v-for="header in props.headers"
						:key="header.text"
						:class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
						@click="changeSort(header.value)"
					>
						<v-icon small>arrow_upward</v-icon>
						{{ header.text }}
					</th>
				</tr>
			</template>
			<template slot="items" slot-scope="props">
				<tr :active="props.selected" >
						<td><v-checkbox  @change="toggleFileSelect(props.item)" :input-value="props.selected" primary	hide-details></v-checkbox></td>
						<td @click="navigateTo('file-list', props.item.path)" class="text-xs-center">{{ props.item.name }}</td>
						<td @click="navigateTo('file-list', props.item.path)" class="text-xs-center">{{ props.item.size | fileSize }}</td>
						<td @click="navigateTo('file-list', props.item.path)" class="text-xs-center">{{ props.item.mdate | formDateFromNow }}</td>
						<td @click="navigateTo('file-list', props.item.path)" class="text-xs-center">{{ props.item.owner }}</td>
				</tr>
			</template>
		</v-data-table>
</v-container>
</template>

<script>
	import Mixins       from '../mixins';
	const _includes = require('lodash/includes');
	import { mapActions, mapGetters, mapState } from 'vuex'

	export default {
		mixins:[
			Mixins
		],
		components: {
			// FileDetails
		},
		data() {
			return {
			createFolder: false,
      pagination: {
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
				  value: true
				},{
					name: 'Folders',
					value: true
				}, {
					name: 'Hidden',
					value: false
				}
			],
			path    : [],
			breadcrumbs: 	[],
			files   : [],
			self    : {},
			newFolderName	: ''
		}
	},
	mounted () {
		this.loadFolder();
	},
	methods: {
		...mapActions('files',['resetFileSelection', 'addFileSelection', 'removeFileSelection']),

		toggleFileSelect(item) {
			if(_includes(this.selected, item)){
				this.removeFileSelection(item)
			}
			else{
				this.addFileSelection(item)
			}
		},

		toggleAll () {
			if (this.selected.length) {
				for(let item in this.selected){
					this.removeFileSelection(item)
				}
				this.selected = []
			}
			else {
				this.selected = this.files.slice()
				for (let item in this.selected) {
					this.addFileSelection(item)
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

// TODO AUSTAUSCHEN!!

		async loadFolder() {
			if (!this.iAmActive)
				return false;
			this.loading = true;
			this.path = [];
			let absolutePath = this.route.params.item;
			if (this.$route.params.item === 'home') {
				absolutePath = '/';
			}
			if (navigator.onLine) {
				this.offlineNotified = false;
					// List all files
				try {
					let files = await this.$client.files.list(absolutePath);
					// Remove the root element
					files = files.splice(1);
						this.files = files.map(file => {
						return ({
							type    : (file.type === 'dir') ? 'folder' : file.type,
							starred : false,
							mdate   : file['fileInfo']['{DAV:}getlastmodified'],
							cdate   : '',    //TODO: Retrieve data of creation of a file
							size    : function () {
							if (file.type === 'dir') {
								return file['fileInfo']['{DAV:}quota-used-bytes'] / 100
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
							});
						});

						// Save files in the cache
						localStorage.setItem(absolutePath, JSON.stringify(this.files));

						this.self = files.self;

						this.loading = false;

						this.resetFileSelection();
					}
					catch (error) {
						this.$uikit.notification({
							message: error.statusText || error,
							status: 'danger',
							pos: 'top-center'
						});
					}
				} else {
					// If the user has not been notified
					if(!this.offlineNotified){
						this.$uikit.notification({
							message: `You are currently offline. Latest changes may not be available`,
							status: 'primary'
						});

						this.offlineNotified = true;
					}

					let cachedFiles = JSON.parse(localStorage.getItem(absolutePath));
					if(cachedFiles == null){
						cachedFiles = [];
					}

					this.files = cachedFiles;

					this.self = cachedFiles.self;

					this.loading = false;

					// this.resetFileSelection();
				}
			},

			async createNewFolder(newFolderName) {
				if(newFolderName !== ''){
					this.$uikit.dropdown(this.$refs.newFolderDropdown).hide();
					try {
						let res = await this.$client.files.createFolder(((this.item === 'home') ? '/' : this.item) + newFolderName);
						this.loadFolder();
					}
					catch (err) {
						if(err === 'The resource you tried to create already exists') {
							this.$uikit.notification({
								message: err,
								status: 'danger',
								pos: 'top-center'
							});
						}else{
							//TODO
							console.log(err);
						}
					}
				}else{
					this.$uikit.notification({
						message: 'Please enter a folder name',
						status: 'danger',
						pos: 'top-center'
					});
				}
			},




            ifFiltered(item) {
                if(item.type === 'folder'){
                	return this.filterBy.folder;
                } else {
                    if (item.name.startsWith('.')) {
                        return this.filterBy.hidden;
                    } else{
                        return this.filterBy.files;
                    }
				}
            },

			async onDrop(dropLocation, dropData, dragData, event) {
				try {
					if (dropLocation === 'file-list' && dropData.type === 'folder') {
						await this.$client.files.move(dragData.path, dropData.path + dragData.name);
						this.loadFolder();
					} else if (dropLocation === 'breadcrumb') {
						await this.$client.files.move(dragData.path, dropData + '/' + dragData.name);
						this.loadFolder();
					}
				}
				catch (err) {
					//TODO
					console.log(err);
				}
            }
		},
		watch: {
			item () {
				this.loadFolder();
			}
		},
		computed: {
			...mapState(['route']),

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
				return this.$route.name === 'file-list';
			}
		}
	}
</script>
