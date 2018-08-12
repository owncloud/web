<template lang="pug">
	// material icon mixin
	mixin icon(a)
		i.material-icons(class=a.class)= a.icon

	#files-app.uk-height-1-1(@contextmenu="contextHandler($event)")
		transition(name="fade")
			span(v-show="loading").oc-loader-spinner

		<!--div(uk-dropdown ref="contextMenu")-->
			<!--ul.uk-nav.uk-dropdown-nav-->
				<!--li Download-->
				<!--li Item A-->
				<!--li Item B-->

		.uk-position-relative
			ul(uk-grid).uk-padding-small.uk-flex.uk-flex-middle.uk-background-muted
				li.uk-flex.uk-flex-center
					.material-icons.burger.cursor-pointer create_new_folder
					div(uk-dropdown="mode: click", ref="newFolderDropdown", v-on:beforeshow="newFolderName = ''")
						form
							input.uk-input.uk-form-small(type='text', v-model="newFolderName", placeholder='Folder name')
							button.uk-button.uk-button-primary.uk-button-small.uk-margin-small-top(@click="createNewFolder(newFolderName)") OK

				li.uk-width-expand
					ol.uk-breadcrumb.uk-margin-remove-bottom
						li.uk-flex.uk-flex-center
							drop(@drop="onDrop('breadcrumb', '', ...arguments)")
								router-link(:to="{ name: 'file-list', params: { item: 'home' }}", tag="i").material-icons.burger.cursor-pointer home
						li(v-for="(pathItem, pId) in path")
							drop(@drop="onDrop('breadcrumb', pathItem, ...arguments)")
								router-link(:to="{ name: 'file-list', params: { item: pathItem }}").cursor-pointer {{ pathItem.split('/').slice(-1)[0] }}
				li
					span {{ files.length }} Results
				li
					button.uk-button.uk-button-material.uk-button-small
						i.material-icons.uk-margin-small-right filter_list
						span Filter
					div(uk-dropdown="mode: click")
						ul.uk-list.uk-margin-remove
							li
								label
									input.uk-checkbox(type='checkbox', name='Accepted', v-model="filterBy.files")
									span(:class="{ 'uk-text-primary' : filterBy.accepted }").uk-text-meta.uk-margin-small-left Files
							li
								label
									input.uk-checkbox(type='checkbox', name='Pending', v-model="filterBy.folder")
									span(:class="{ 'uk-text-primary' : filterBy.pending }").uk-text-meta.uk-margin-small-left Folder
							li
								label
									input.uk-checkbox(type='checkbox', name='Pending', v-model="filterBy.hidden")
									span(:class="{ 'uk-text-primary' : filterBy.hidden }").uk-text-meta.uk-margin-small-left Hidden files
			div(uk-grid).uk-grid-collapse
				main.uk-width-expand._scroll_container
					table.file-table-header.uk-table.uk-table-middle.uk-table-divider.uk-margin-remove
						thead
							tr
								th
									input(type="checkbox").uk-checkbox.uk-margin-small-left
								th Name
								th(class="uk-visible@l").uk-text-right Owner
								th Size
								th(class="uk-visible@s") Date
						tbody
							tr(v-for="(file, id) in files", :data-file-id="file._id", :class="{ '_is-selected' : isChecked(file) }").uk-animation-fade
								td.uk-table-shrink
									input(type="checkbox", :checked="isChecked(file)", @click="toggleFileSelect(file)").uk-checkbox.uk-margin-small-left

								// --- Name ----------
								td(v-if="!file.extension", @click="singleSelect(file)").uk-text-truncate.uk-visible-toggle
									drag(:transfer-data="file")
										drop(@drop="onDrop('file-list', file, ...arguments)")
											a(@click.stop="routerLink(file.path)").uk-link-text.uk-position-relative
												i.material-icons.uk-text-primary.uk-position-center-left {{ file.type }}
												span {{ file.name }}

								td(v-else).uk-text-truncate(@click="toggleFileSelect(file)")
									a(@click.stop="endOfDummy").uk-link.uk-position-relative
										i.material-icons.uk-text-primary.uk-position-center-left {{ file.type }}
										span {{ file.name }}
									span.uk-text-meta .{{ file.extension }}

								// --- Owner ----------
								td(class="uk-visible@l").uk-text-nowrap.uk-table-shrink.uk-text-right
									div(v-if="file.sharedIn").uk-text-meta.uk-inline
										span(uk-tooltip, :title="file.sharedIn.mail") {{ file.sharedIn.name }}

								// --- Size ------------------
								td.uk-text-nowrap.uk-table-shrink
									span.uk-text-meta {{ file.size | fileSize }}

								// --- Filedate ------------------
								td(class="uk-visible@s").uk-text-nowrap.uk-table-shrink
									time.uk-text-meta {{ file.mdate | formDateFromNow }}

				aside.uk-width-medium.uk-background-default.uk-padding-small(v-show="selected.length > 0", class="uk-width-large@l uk-padding@l").uk-animation-slide-right-small
					FileDetails(@reset="resetFileSelection")
</template>

<script>
	import Mixins       from '../mixins';
	import FileDetails  from './File-Details.vue';

	const _includes = require('lodash/includes');
	const _filter   = require('lodash/filter');

	const store     = require('../store');

	export default {
		mixins      : [Mixins],
		components  : {FileDetails},
		data() {
			return {
				loading : false,
				filterBy: {
					files   : true,
					folder  : true,
					hidden  : false
				},
				path    : [],
				files   : [],
				self    : {},

				newFolderName	: ''
			}
		},
		beforeMount () {
			// Extend the store (only once)
			if (!this.$store.state.files) {
				this.$store.registerModule('files', store.default);
			}
		},
		mounted () {
			if (this.userLoggedIn) {
				this.loadFolder();
			}
			else {
				this.$events.emit('phoenix:request-login');
			}
		},
		methods: {
			goto(e) {
				this.$route.push()
			},

			toggleFavorite(item) {
				this.files[item].stared = (!this.files[item].stared);
			},

			routerLink(itemPath) {
				if(itemPath.endsWith('/')) {
					this.$router.push({
						name: 'file-list',
						params: {
							item: itemPath
						}
					})
				}
			},

			contextHandler(event) {
				// if(event.target.tagName === 'TD'){
				// 	this.contextMenuTop = event.pageY;
				// 	this.contextMenuLeft = event.pageX;
				//
				// 	let dropdown = this.$uikit.dropdown(this.$refs.contextMenu);
				// 	dropdown.show();
				// }
				// event.preventDefault();
			},

			loadFolder() {
				if (!this.iAmActive)
					return false;

				this.loading = true;

				this.path = [];
				let absolutePath = this.$route.params.item;
				if (this.$route.params.item === 'home') {
					absolutePath = '/';
				} else {
					let pathSplit  = absolutePath.split('/').filter((val) => val);
					for (let i = 0; i < pathSplit.length; i++) {
						this.path.push('/' + pathSplit.slice(0, i + 1).join('/'));
					}
				}

				// List all files
				this.$client.files.list(absolutePath).then(files => {
					// Remove the root element
					files = files.splice(1);

					this.files = files.map(file => {
						return ({
							type : (file.type === 'dir') ? 'folder' : file.type,
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

					this.self = files.self;

					this.loading = false;

					this.resetFileSelection();
				}).catch(error => {
					this.$uikit.notification({
						message: error.statusText,
						status: 'danger',
						pos: 'top-center'
					});
				});
			},

			createNewFolder(newFolderName) {
				if(newFolderName !== ''){
					this.$uikit.dropdown(this.$refs.newFolderDropdown).hide();
					this.$client.files.createFolder(((this.item === 'home') ? '/' : this.item) + newFolderName)
						.then(res => {
							this.loadFolder();
						}).catch(err => {
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
					});
				}else{
					this.$uikit.notification({
						message: 'Please enter a folder name',
						status: 'danger',
						pos: 'top-center'
					});
				}
			},

			resetFileSelection() {
				this.$store.dispatch('files/RESET_SELECTION')
			},

			toggleFileSelect(item) {
				if (this.isChecked(item))
					this.$store.dispatch('files/REMOVE_FILE_SELECTION', item);
				else
					this.$store.dispatch('files/ADD_FILE_SELECTION', item);
			},

			isChecked(item) {
				return _includes(this.selected, item);
			},

            onDrop(dropLocation, dropData, dragData, event) {
                if (dropLocation === 'file-list' && dropData.type === 'folder') {
                    this.$client.files.move(dragData.path, dropData.path + dragData.name).then(res => {
                        this.loadFolder();
                    });
                } else if (dropLocation === 'breadcrumb') {
                    this.$client.files.move(dragData.path, dropData + '/' + dragData.name).then(res => {
                        this.loadFolder();
                    });
                }
            }
		},
		watch: {
			item () {
				this.loadFolder();
			},
			userLoggedIn (cur, prev) {
				if (cur !== prev)
					this.loadFolder()
			}
		},
		computed: {
			selected () {
				return this.$store.getters['files/SELECTED'];
			},

			item() {
				return this.$route.params.item;
			},

			typeOfFolder() {
				return _filter(this.files, ['extension', false])
			},

			typeOfFile(showHidden) {
				showHidden = (typeof showHidden !== 'undefined') ? showHidden : false;
				return _filter(this.files, 'extension')
			},

			userLoggedIn () {
				return this.$store.getters.USER_LOGGED_IN;
			},

			iAmActive () {
				return this.$route.name === 'file-list';
			}
		}
	}
</script>

<style lang="less">

	#files-app {
		._scroll_container {
			display: block;
			overflow-x: hidden;
			overflow-y: auto;

			&::-webkit-scrollbar {
				background-color: #f8f8f8;
				width: 5px;
			}

			&::-webkit-scrollbar-track {
				-webkit-box-shadow: none;
			}

			&::-webkit-scrollbar-thumb {
				background-color: #e5e5e5;
			}
		}
	}

	.burger {
		font-size: 24px; // keep original font size for material icons
	}

	.material-icon {
		&.-x075 {
			font-size: 75%;
		}
	}

	.cursor-pointer {
		cursor: pointer;
	}

	.oc-highlight {
		color: #E56F35;
	}

	.uk-iconnav li {
		height: 24px;
	}

	._is-selected {
		background-color: #f8f8f8;
	}

	._is-starred {
		color: #faa05a;
	}

	.material-icons.uk-position-center-left {

		transform: translateY(-55%);

		+ span {
			padding-left: 30px;
		}
	}
</style>
