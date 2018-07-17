<template>
	<div class="uk-card uk-card-default">
	    <div class="uk-card-header">
	        <h3 class="uk-card-title">Login Attributes</h3>
	    </div>
	    <div class="uk-card-body" v-if="expanded">
			<div class="uk-grid-small" uk-grid>
				<div class="uk-width-1-1">
					<label>
						<input class="uk-checkbox uk-margin-small-right" type="checkbox" v-model="login.username">
						<span class="uk-form-label">LDAP / AD Username</span>
					</label>
				</div>
				<div class="uk-width-1-1">
					<label>
						<input class="uk-checkbox uk-margin-small-right" type="checkbox" v-model="login.email">
						<span class="uk-form-label" v-text="'LDAP / AD Email Address'"></span>
					</label>
				</div>
				<div class="uk-width-1-1 uk-margin-large-bottom">
					<textarea class="uk-textarea" placeholder="LDAP Filter" style="font-family:Courier" v-model="login.filter"></textarea>
				</div>
	    	</div>
		</div>
	</div>
</template>
<script>
export default {
	props: ["login"],
	data () {
		return {
			expanded: false
		}
	}
}
</script>
