<template lang="pug">
	// material icon mixin
	mixin icon(a)
		i.material-icons(class=a.class)= a.icon

	#file-details.uk-position-relative
		button(type="button", uk-close, @click="close").uk-position-top-right
		section(v-if="file")
			.uk-grid-small.uk-flex-middle(uk-grid)
				.uk-width-auto
					i.material-icons.-x2 {{ file.type }}

				.uk-width-expand
					h3.uk-card-title.uk-margin-remove-bottom.uk-text-truncate {{ file.name }}
						span(uk-icon="icon: link", uk-tooltip, title="Copy local link", style="cursor:pointer").uk-margin-small-left

					p.uk-margin-remove-top
						span.uk-text-meta Size:&nbsp;
						span.uk-text-small {{ file.size | fileSize }}

			Buttonrow(:files="file")

			ul(:uk-switcher="'connect:#'+switcherId", data-exp="file-details-panel-tabs").uk-child-width-expand.uk-tab
				li.uk-active
					a(href="") Info
				li(v-for="(plugin, pid) in extendButtonRow", :key="pid")
					a(href="") {{ plugin.title }}

			ul.uk-switcher(data-exp="file-details-panel-contents", :id="switcherId")
				li
					.uk-overflow-hidden
						table.uk-table.uk-table-small.uk-text-meta
							tbody
								tr
									td Modified:
									td.uk-table-expand {{ file.mdate | formDateTime }}
								tr.uk-padding-bottom-small
									td Created:
									td.uk-table-expand {{ file.cdate | formDateTime }}
								tr(v-for="(meta, key) in file.meta")
									td {{ key | ucFirst }}:
									td.uk-table-expand {{ meta }}
				component(v-for="(plugin, pid) in extendButtonRow", :is="plugin.component", :key="pid", v-if="extendButtonRow.length > 0")

		section(v-if="files")
			.uk-grid-small.uk-flex-middle(uk-grid)
				.uk-width-auto
					i.material-icons.-x2 filter_{{ files.length }}

				.uk-width-expand
					h3.uk-card-title.uk-margin-remove-bottom.uk-text-truncate Multiple files
						span(uk-icon="icon: link", uk-tooltip, title="Copy local link", style="cursor:pointer").uk-margin-small-left

					p.uk-margin-remove-top
						span.uk-text-meta Size:&nbsp;
						span.uk-text-small {{ accumulatedFilesSize | fileSize }}

			Buttonrow(:files="file")

			hr.uk-hr
			ul.uk-list.uk-list-bullet
				li(v-for="item in files") {{ item.name }}
</template>

<script>
const _each = require('lodash/each');
const _size = require('lodash/size');
const _filter = require('lodash/filter');
const _unique = require('lodash/uniqueId');

import Mixins from '../mixins';
import Buttonrow from './File-Details-Buttonrow.vue';

export default {
	mixins: [Mixins],
	components: {
		Buttonrow
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
<style lang="less">
	.material-icons {
		user-select: none;

		&.-x2 {
			font-size: 48px;
		}
	}

	.uk-button-small .material-icons {
		font-size: 16px;
	}
</style>
