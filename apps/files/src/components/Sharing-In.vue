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
					span.uk-margin-small-left Shared with you
				li
					span {{ statusFilter(shared).length }} Results
				li
					button.uk-button.uk-button-material.uk-button-small
						i.material-icons.uk-margin-small-right filter_list
						span Filter
					div(uk-dropdown="mode: click")
						ul.uk-list.uk-margin-remove
							li
								label
									input.uk-checkbox(type='checkbox', name='Accepted', v-model="filterBy.accepted")
									span(:class="{ 'uk-text-primary' : filterBy.accepted }").uk-text-meta.uk-margin-small-left Accepted
							li
								label
									input.uk-checkbox(type='checkbox', name='Pending', v-model="filterBy.pending")
									span(:class="{ 'uk-text-primary' : filterBy.pending }").uk-text-meta.uk-margin-small-left Pending
							li
								label
									input.uk-checkbox(type='checkbox', name='Rejected', v-model="filterBy.rejected")
									span(:class="{ 'uk-text-primary' : filterBy.rejected }").uk-text-meta.uk-margin-small-left Rejected

			div(uk-grid).uk-grid-collapse
				main.uk-width-expand
					table.file-table-header.uk-table.uk-table-middle.uk-table-divider
						thead
							tr
								th
									input(type="checkbox").uk-checkbox.uk-margin-small-left
								th Name
								th Status
								th(class="uk-visible@s") Shared by
								th(class="uk-visible@m") Shared
								th Action
						tbody
							tr(v-for="(file, id) in statusFilter(shared)", :data-file-id="file._id", :class="{ '-is-selected' : isChecked(file) }")
								td.uk-table-shrink
									input(v-if="file.sharedIn.state == 2", type="checkbox", :checked="isChecked(file)", @click="multiSelect(file)").uk-checkbox.uk-margin-small-left
									input(v-else, disabled).uk-checkbox.uk-margin-small-left

								// --- Name ----------
								td(@click="singleSelect(file)", v-if="file.sharedIn.state <= 1").uk-text-truncate
									a(@click.stop="routerLink(file.name)").uk-link-text.uk-position-relative
										i.material-icons.uk-text-primary.uk-position-center-left {{ file.type }}
										span {{ file.name }}

								td(v-else).uk-text-truncate
									span.uk-position-relative
										i.material-icons.uk-text-muted.uk-position-center-left {{ file.type }}
										span.uk-text-muted {{ file.name }}

								// --- Status ----------
								td.uk-text-nowrap.uk-table-shrink.uk-text-meta
									span(v-if="file.sharedIn.state == 2").uk-label.uk-label-muted Rejected
									span(v-else-if="file.sharedIn.state == 0").uk-label Pending

								// --- Sharee ----------
								td(class="uk-visible@s").uk-text-nowrap.uk-table-shrink.uk-text-meta {{ file.sharedIn.name }}

								// --- Date -----------
								td(class="uk-visible@m").uk-text-nowrap.uk-table-shrink.uk-text-meta {{ file.sharedIn.cdate | formDateFromNow }}

								td.uk-table-shrink.uk-text-right
									section.uk-button-group
										.uk-button.uk-button-small.uk-button-primary.uk-button-material
											i.material-icons cloud_download
										button(v-if="file.sharedIn.state != 2").uk-button.uk-button-small.uk-button-danger.uk-button-material
											i.material-icons cloud_off
										button.uk-button.uk-button-small.uk-button-default.uk-button-material
											i.material-icons more_horiz
										DropdownMenu(:shared="file.sharedIn")




				aside.uk-width-medium.uk-background-default.uk-padding-small(v-if="selected.length > 0", class="uk-width-large@l uk-padding@l").uk-animation-slide-right-small
					FileDetails(:file="selected" @reset="resetSelect")
</template>

<script>
import _            from 'lodash';
import jquery       from 'jquery';

import Mixins       from '../mixins';
import FileDetails  from './File-Details.vue';
import DropdownMenu from './Sharing-In-Dropdown.vue';

export default {
	mixins: [Mixins],
	components: {
		FileDetails,
		DropdownMenu
	},
	data() {
		return {
			loading: false,
			filterBy: {
				accepted: true,
				pending: true,
				rejected: true
			},
			shared: [],
			selected: []
		}
	},
	mounted() {
		this.loadShares();
	},
	filters: {
		stateText (no) {
			let icons = [];
			icons[0]  = 'Pending';
			icons[1]  = 'Accepted';
			icons[2] = 'Rejected';

			return icons[no];
		}
	},
	methods: {
		loadShares() {
			this.loading = true;

			jquery.getJSON(`apps/files/files/home.json`, (data) => {

				this.shared = _.filter(data.files, 'sharedIn');
				this.loading = false;

				this.resetSelect();

			}).fail(function (e) {
				UIkit.notification({
					message: e.statusText,
					status: 'danger',
					pos: 'top-center'
				});
			})
		},
		statusFilter (shared) {
			let t = this;
			return _.filter(shared, (share) => {
				if (share.sharedIn.state === 0 && t.filterBy.pending) return share
				if (share.sharedIn.state === 1 && t.filterBy.accepted) return share
				if (share.sharedIn.state === 2 && t.filterBy.rejected) return share
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
	computed: {
		filessharedOut () {
			return _.filter(this.files, 'sharedOut');
		},
	}
}
</script>

<style lang="scss">

	.file-table-body-wrapper {
		display: block;
		overflow-x: hidden;
		overflow-y: auto;
		height: calc(100vh - 185px);

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

	.burger {
		font-size: 24px; // keep original font size for material icons
	}

	.material-icons {
		&.-x075 {
			font-size: 20px;
		}
	}

	.show-on-hover:not(:hover) {
		opacity: 0;
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

	.-is-selected {
		background-color: #F5F7F9;
	}

	#files-app {
		tr:not(:hover) td ._share-action {
			opacity: 0;
		}

		._share-action {
			float: right;
		}
	}
</style>
