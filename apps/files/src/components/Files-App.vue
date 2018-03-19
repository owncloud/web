<template lang="pug">
	// material icon mixin
	mixin icon(a)
		i.material-icons(class=a.class)= a.icon

	#files-app
		transition(name="fade")
			span(v-show="loading").oc-loader-spinner

		.uk-position-relative
			ul(uk-grid).uk-padding-small.uk-flex.uk-flex-middle.uk-background-muted
				li.uk-width-expand
					ol.uk-breadcrumb.uk-margin-remove-bottom
						li.uk-flex.uk-flex-center
							router-link(:to="{ name: 'files', params: { item: 'home' }}", tag="i").material-icons.burger.cursor-pointer home
						li(v-for="pathItem, pid in path")
							router-link(:to="{ name: 'files', params: { item: pathItem.toLowerCase() }}").cursor-pointer {{ pathItem }}
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
								th(class="uk-visible@l").uk-text-right Shared with
								th(class="uk-visible@l").uk-text-right Owner
								th Size
								th(class="uk-visible@s") Date
						tbody
							tr(v-for="(file, id) in files", :data-file-id="file._id", :class="{ '_is-selected' : isChecked(file) }").uk-animation-fade
								td.uk-table-shrink
									input(type="checkbox", :checked="isChecked(file)", @click="multiSelect(file)").uk-checkbox.uk-margin-small-left

								// --- Name ----------
								td(v-if="!file.extension", @click="singleSelect(file)").uk-text-truncate.uk-visible-toggle
									a(@click.stop="routerLink(file.name)").uk-link-text.uk-position-relative
										i.material-icons.uk-text-primary.uk-position-center-left {{ file.type }}
										span {{ file.name }}

								td(v-else).uk-text-truncate(@click="singleSelect(file)")
									a(@click.stop="endOfDummy").uk-link.uk-position-relative
										i.material-icons.uk-text-primary.uk-position-center-left {{ file.type }}
										span {{ file.name }}
									span.uk-text-meta .{{ file.extension }}

								// --- Shared ----------
								td(class="uk-visible@l").uk-text-nowrap.uk-table-shrink.uk-text-right
									div(v-if="file.sharedOut").uk-text-meta.uk-inline
										span._sharee(v-for="(sharer, sid) in file.sharedOut", uk-tooltip, :title="sharer.mail") {{ sharer.name }}

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

				aside.uk-width-medium.uk-background-default.uk-padding-small(v-if="selected.length > 0", class="uk-width-large@l uk-padding@l").uk-animation-slide-right-small
					FileDetails(:file="selected" @reset="resetSelect")
</template>

<script>
import Mixins      from '../mixins';
import FileDetails from './File-Details.vue';

import jquery      from 'jquery';

const remove   = require('lodash/remove');
const includes = require('lodash/includes');
const filter   = require('lodash/filter');

export default {
	mixins: [Mixins],
	components: {FileDetails},
	data() {
		return {
			loading: false,
			filterBy: {
				files: true,
				folder: true,
				hidden: false
			},
			path: null,
			files: [],
			selected: [],
			self: {}
		}
	},
	mounted() {
		this.loadFolder();
	},
	methods: {
		goto (e) {
			this.$route.push()
		},
		toggleFavorite (item) {
			this.files[item].stared = (this.files[item].stared) ? false : true;
		},
		routerLink (item) {
			this.$router.push({
				name: 'files',
				params: {
					item: item.toLowerCase()
				}
			})
		},
		loadFolder() {
			this.loading = true;

			jquery.getJSON(`apps/files/files/${this.item}.json`, (data) => {

				let delay = Math.random() * (1000 - 200) + 200;

				setTimeout( () => {
					this.path    = data.path;
					this.files   = data.files;
					this.self    = data.self;
					this.loading = false;
					this.resetSelect();
				}, delay)

			}).fail(function (e) {
				console.log(e);
				UIkit.notification({
					message: e.statusText,
					status: 'danger',
					pos: 'top-center'
				});
			})
		},
		singleSelect (item) {
			this.selected = [item];
		},
		resetSelect () {
			this.selected = [];
		},
		multiSelect (item) {
			if (this.isChecked(item))
				_.remove(this.selected, item);
			else
				this.selected.push(item);
		},
		isChecked(item) {
			return _.includes(this.selected, item);
		}
	},
	watch: {
		item () {
			this.loadFolder()
		}
	},
	computed: {
		item () {
			return this.$route.params.item.toLowerCase();
		},
		typeOfFolder () {
			return _.filter(this.files, ['extension' , false ])
		},
		typeOfFile (showHidden) {
			showHidden = (typeof showHidden !== 'undefined') ?  showHidden : false;
			return _.filter(this.files, 'extension')
		}
	}
}
</script>

<style lang="scss">

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

	._sharee {

		& + ._sharee::before {
			content: ", ";
		}

		&:last-of-type:nth-of-type(n+2)::before {
			content: " & ";
		}
	}

	.material-icons.uk-position-center-left {

		transform: translateY(-55%);

		+ span {
			padding-left: 30px;
		}
	}
</style>
