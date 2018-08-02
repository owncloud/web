<template>
	<section uk-grid id="user_ldap-wizard-server">
		<main class="uk-width-expand">
			<div class="uk-card uk-card-default">
				<div class="uk-card-header uk-position-relative" @click="$parent.toggleTab('users')" style="cursor:pointer;">
					<h3 class="uk-card-title uk-margin-remove">Users Mapping</h3>
					<i class="material-icons uk-position-small uk-position-center-right">
						<span v-if="isActive">keyboard_arrow_down</span>
						<span v-else>keyboard_arrow_left</span>
					</i>
				</div>
				<div class="uk-card-body" v-if="isActive">
					<div class="uk-grid-small" uk-grid>
						<div class="uk-width-4-5">
							<div uk-grid class="uk-grid-collapse">
								<label class="uk-width-auto uk-form-label-sticky min-width-90">
									<i class="material-icons">wc</i>
								</label>
								<input type="text" class="uk-input uk-width-expand" v-model="options.lookup" placeholder="Username, E-Mail or DN" v-on:focus="toggleTip('lookup')">
							</div>
						</div>
						<div class="uk-width-1-5">
							<button v-if="options.lookup.length" type="button" name="button" class="uk-button uk-width-1-1 uk-button-primary" @click="lookup">Submit</button>
							<button v-else type="button" name="button" class="uk-button uk-width-1-1 uk-button-default" disabled>Submit</button>
						</div>
					</div>
					<section class="_usercard uk-padding-small uk-background-muted" v-if="showUserCard">
						<div uk-grid>
							<div class="uk-width-1-1">
								<strong>Preview</strong>
							</div>
							<div class="uk-width-small">
								<img :src="appPath + '/images/account_box-128px.svg'" class="_avatar" alt="Avatar">
							</div>
							<div class="uk-width-expand" id="user_ldap_usercard">
								<div uk-grid class="uk-grid-collapse">
									<label class="uk-width-auto uk-form-label-sticky min-width-90">Username:</label>
									<select class="uk-select uk-width-expand" v-model="mapping.userName" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }} [{{ attr }}]</option>
									</select>
								</div>
								<div uk-grid class="uk-grid-collapse uk-margin-small-top">
									<label class="uk-width-auto uk-form-label-sticky min-width-90">Displayname:</label>
									<select class="uk-select uk-width-expand" v-model="mapping.displayName" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }} [{{ attr }}]</option>
									</select>
								</div>
								<div uk-grid class="uk-grid-collapse uk-margin-small-top">
									<label class="uk-width-auto uk-form-label-sticky min-width-90">E-Mail:</label>
									<select class="uk-select uk-width-expand" v-model="mapping.email" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }} [{{ attr }}]</option>
									</select>
								</div>
								<div uk-grid class="uk-grid-collapse uk-margin-small-top">
									<label class="uk-width-auto uk-form-label-sticky min-width-90">Avatar:</label>
									<select class="uk-select uk-width-expand" v-model="mapping.avatar" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }} [{{ attr }}]</option>
									</select>
								</div>
								<div uk-grid class="uk-grid-collapse uk-margin-small-top">
									<label class="uk-width-auto uk-form-label-sticky min-width-90">Quota:</label>
									<select class="uk-select uk-width-expand" v-model="mapping.quota" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }} [{{ attr }}]</option>
									</select>
								</div>
								<div uk-grid class="uk-grid-collapse uk-margin-small-top">
									<label class="uk-width-auto uk-form-label-sticky min-width-90">Homedir:</label>
									<select class="uk-select uk-width-expand" v-model="mapping.homeDir" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }} [{{ attr }}]</option>
									</select>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		</main>
		<aside class="uk-width-medium uk-width-large@l">
			<div uk-sticky="offset: 80; bottom: true">
				<div uk-alert class="uk-alert-primary">
					<h3>
						2. Let's do some magic
					</h3>
					<p>
						<!-- <img :src="appPath + '/images/wand.svg'" class="_wand uk-float-left uk-margin-small-right" alt="LDAP Wizard"> -->
						The wizard helps you map fields to the right keys. Using an arbitrary user from your LDAP directory.
					</p>
					<p v-if="showUserCard" class="uk-animation-slide-top-small">
						<i class="_tip-icon material-icons">account_box</i>
						Select the appropriate keys to the thingis on the left or whatever. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
					</p>
				</div>
				<div uk-alert v-if="tips.lookup" class="uk-alert-primary uk-animation-shake">
					<a class="uk-alert-close" uk-close @click="tips.lookup = false"></a>
					<p>
						<i class="_tip-icon material-icons">wc</i>
						Fill in an arbitrary username, e-mail-adress or user-dn you know exists in your directory. This will server as a template to map the stuff that needs to be mapped. This is clearly demo text.
					</p>
				</div>
			</div>
		</aside>
	</section>
</template>
<script>

export default {
	props: ["users", "is-active"],
	data () {
		return {
			tips : {
				lookup: false
			},
			options : {
				lookup: "",
				result: {}
			},
			mapping : {
				userName : "",
				displayName: "",
				secondDisplayName: "",
				email : "",
				avatar : "",
				quota : "",
				userId : "",
				homeDir : ""
			}
		}
	},
	computed : {
		id (item) {
			return _uniqueId(`user_ldap__${item}_`);
		},
		appPath () {
			return '/apps/user_ldap'
		},
		showUserCard () {
			return Object.keys(this.options.result).length
		}
	},
	methods : {
		lookup () {
			// for DEMO purposes
			this.options.lookup = '';
			this.options.result = {
				dn : "cn=user,dc=example,dc=com",
				samaccountname : "klaus.taler",
				email : "max@mustermail.de",
				displayname : "Klaus Taler",
				objectguid : "ed11cdd9-c28e-4440-a88f-152feb42371e",
				jpegphoto : "https://www.fillmurray.com/300/300",
				quota : 0,
				userprincipalname : "klaus@example.com",
				surname : "Klaus",
				givenname: "Taler",
				cn : "Taler, Klaus"
			};

			// prefill if certain attribues exists
			this.mapping.userName = (this.options.result.samaccountname) ? 'samaccountname' : "";
			this.mapping.email    = (this.options.result.email)          ? 'email' : "";
			this.mapping.avatar   = (this.options.result.jpegphoto)      ? 'jpegphoto' : "";
		},
		toggleTip ( item ) {
			console.log(item, this.options[item].length);

			if (this.options[item].length === 0)
				this.tips[item] = true;
		}
	},
	mounted () {
		// for DEMO purposes
		// this.lookup();
	}
}
</script>
<style scoped>
	#user_ldap_usercard label {
		min-width: 110px;
	}

	._wand {
		width: 40px;
		height: 40px;
	}

	._usercard {
		margin-top: 15px;
	}

	._tip-icon {
		font-size: 40px;
		transform: translateY(2px);
		float: left;
		margin-right: 10px;
	}
</style>
