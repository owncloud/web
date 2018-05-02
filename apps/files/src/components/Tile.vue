<template lang="pug">
	transition(name="fade")
		li(class='uk-width-1-2@m uk-width-1-3@xl', v-if="application").uk-animation-slide-top-small_
			.uk-card.uk-card-default
				.uk-card-header
					div(uk-grid)
						.uk-width-expand
							.uk-flex.uk-flex-middle
								h3.uk-card-title.uk-text-truncate.uk-margin-remove-bottom.uk-float-left.uk-margin-small-right
									router-link(:to="{ name: 'details', params: { id: application.id }}") {{ application.name }}

							p.uk-text-meta.uk-margin-remove-top
								span(uk-icon="icon: tag")
								span.category &nbsp;{{ application.categories[0] }}
								span.uk-position-bottom-right.uk-position-small(v-if="application.updateInfo").uk-box-shadow-small.uk-label.uk-label-warning.uk-margin-small-left {{ t('Update available') }}!
								span.uk-position-bottom-right.uk-position-small(v-if="application.installed && !application.updateInfo").uk-box-shadow-small.uk-label.uk-margin-small-left {{ t('Installed') }}!

						.uk-width-small.uk-text-right
							rating(:rating="application.rating")

				.uk-card-media-top
					router-link(:to="{ name: 'details', params: { id: application.id }}")
						canvas(width="1600", height="900", :style="application.screenshots[0].url | cssBackgroundImage").app-preview
</template>

<script>
	import Rating from './Rating.vue';

	export default {
		components: {
			Rating
		},
		props: [
			'application'
		],
		filters: {
			cssBackgroundImage (image) {
				return 'background-image:url("' + image + '");';
			}
		},
		methods: {
			t(string) {
				return this.$gettext(string);
			}
		}
	}
</script>

<style scoped>
	.category {
		text-transform: capitalize;
	}

	.app-preview {
		background-size: cover;
		background-position: left center;
	}

	.uk-label {
		border: 1px solid #fff;
	}
</style>
