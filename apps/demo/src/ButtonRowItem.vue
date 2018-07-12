<template lang="html">
	<li>
		<p uk-alert class="uk-alert-primary">
			You guessed right, this is the Demo App providing a little plugin.<br>
			Have fun with your <span v-for="(file, fid) in files" :key="fid" v-text="file.name"></span>
		</p>
	</li>
</template>
<script>
export default {
	computed: {
		files() {
			return this.$store.getters['files/SELECTED'];
		}
	}
}
</script>
