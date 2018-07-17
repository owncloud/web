<template>
	<div class="uk-card uk-card-default">
	    <div class="uk-card-header">
	        <h3 class="uk-card-title">Groups</h3>
	    </div>
		<div class="uk-card-body" v-if="expanded">
			<p>
				ownCloud access is limited to users meeting these criteria:
			</p>
		</div>
	</div>
</template>
<script>
export default {
	props: ["groups"],
	data () {
		return {
			expanded : false,
			options : {}
		}
	},
}
</script>
