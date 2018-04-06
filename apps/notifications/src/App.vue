<template>
	<a>
		<div>
			<i v-if='state === 0' class="material-icons uk-text-inverse">notifications</i>
			<div v-if='state !== 0' class="uk-position-relative">
				<i class="material-icons uk-text-inverse uk-animation-shake">notifications_active</i>
				<span class="uk-badge uk-background-secondary badge-position">{{state}}</span>
			</div>
		</div>
		<div uk-dropdown="mode: click">
			<div class="uk-dropdown-grid uk-child-width-1-2@m" uk-grid>
				<div>
					<ul class="uk-nav uk-dropdown-nav">
						<li v-for="item in notifications">
							{{item.subject}}
						</li>
					</ul>
				</div>
			</div>
		</div>
	</a>
</template>

<script>
	export default {
		mounted() {
			setInterval(() => {
					this.$store.dispatch('FETCH_NOTIFICATIONS');
				}, 4000);

		},
		computed: {
			state() {
				return this.$store.getters.number_of_notifications
			},
			notifications() {
				return this.$store.getters.notifications
			}
		}
	}
</script>

<style scoped>
	.badge-position {
		position: absolute;
		left: -5px;
		bottom: -5px;
	}
</style>