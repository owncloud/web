<template lang="pug">
	// material icon mixin
	mixin icon(a)
		i.material-icons(class=a.class)= a.icon

	#file-details.uk-position-relative
		button(type="button", uk-close, @click="close").uk-position-top-right
		section(v-show="file.length === 1")
			.uk-grid-small.uk-flex-middle(uk-grid, v-if="file.length === 1")
				.uk-width-auto
					i.material-icons.-x2 {{ file[0].type }}

				.uk-width-expand
					h3.uk-card-title.uk-margin-remove-bottom.uk-text-truncate {{ file[0].name }}
						span(uk-icon="icon: link", uk-tooltip, title="Copy local link", style="cursor:pointer").uk-margin-small-left

					p.uk-margin-remove-top
						span.uk-text-meta Size:&nbsp;
						span.uk-text-small {{ file[0].size | fileSize }}

			FileDetailsButtonrow(:files="file")

			ul(uk-switcher="connect: #hou2ifelkje", data-exp="file-details-panel-tabs").uk-child-width-expand.uk-tab
				li.uk-active
					a(href="") Info

			ul#hou2ifelkje.uk-switcher(data-exp="file-details-panel-contents")
				li
					.uk-overflow-hidden(v-if="file.length === 1")
						table.uk-table.uk-table-small.uk-text-meta
							tbody
								tr
									td Modified:
									td.uk-table-expand {{ file[0].mdate | formDateTime }}
								tr.uk-padding-bottom-small
									td Created:
									td.uk-table-expand {{ file[0].cdate | formDateTime }}
								tr(v-for="(meta, key) in file[0].meta")
									td {{ key | ucFirst }}:
									td.uk-table-expand {{ meta }}

		section(v-show="file.length > 1")
			.uk-grid-small.uk-flex-middle(uk-grid)
				.uk-width-auto
					i.material-icons.-x2 filter_{{ file.length }}

				.uk-width-expand
					h3.uk-card-title.uk-margin-remove-bottom.uk-text-truncate Multiple files
						span(uk-icon="icon: link", uk-tooltip, title="Copy local link", style="cursor:pointer").uk-margin-small-left

					p.uk-margin-remove-top
						span.uk-text-meta Size:&nbsp;
						span.uk-text-small {{ accumulatedFilesSize | fileSize }}

			FileDetailsButtonrow(:files="file")

			hr.uk-hr
			ul.uk-list.uk-list-bullet
				li(v-for="item in file") {{ item.name }}
					span(v-if="item.extension").uk-text-meta .{{ item.extension }}
</template>

<script>
	import Mixins  from '../mixins';

	// vue components
	import FileDetailsButtonrow from './File-Details-Buttonrow.vue';

	import $ from 'jquery';

	export default {
		mixins     : [Mixins],
		props      : ['file'],
		components : {
			FileDetailsButtonrow
		},
		data () {
			return {
				recipient : ""
			}
		},
		created () {
			OC.$extend.provide('files', 'file-details-panel', this.extendFileDetailsPanel);
		},
		watch : {
			file () {
				OC.$bus.emit('files:file-details-update', this.file)
			}
		},
		methods : {
			close () {
				this.$emit('reset');
			},
			extendFileDetailsPanel (payload) {

				let p = new Promise((resolve, defer) => {
					let id = OC.createRandom();
					$('[data-exp="file-details-panel-tabs"]').append( '<li><a href="">' + payload[0] + '</a></li>' );
					$('[data-exp="file-details-panel-contents"]').append( $('<li>' , { id : id }));
					resolve(['#'+id, this.file]);
				});
				return p;
			}
		},
		computed   : {
			accumulatedFilesSize () {
				let size = 0;

				_.each(this.file, (e) => {
					size = size + e.size
				});

				return size;
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
