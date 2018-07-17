<template>
	<div class="uk-card uk-card-default">
	    <div class="uk-card-header">
	        <h3 class="uk-card-title">Users</h3>
	    </div>
		<div class="uk-card-body" v-if="expanded">
			<div class="uk-grid-small" uk-grid>
				<div class="uk-width-4-5">
					<input type="text" name="" value="" class="uk-input" v-model="options.lookup" placeholder="Username, E-Mail or DN">
				</div>
				<div class="uk-width-1-5">
					<button type="button" name="button" class="uk-button uk-button-primary" @click="lookup">Submit</button>
				</div>
	    	</div>
			<div uk-grid>
				<div class="uk-width-1-5">
					<img src="https://www.fillmurray.com/300/300" alt="">
				</div>
				<div class="uk-width-4-5">
					<table class="uk-table uk-table-striped">
						<tbody>
							<tr>
								<td>Username</td>
								<td>
									<select class="uk-select" v-model="mapping.userName" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }}: {{ attr }}</option>
									</select>
								</td>
							</tr>
							<tr>
								<td>Displayname</td>
								<td>
									<select class="uk-select" v-model="mapping.displayName" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }}: {{ attr }}</option>
									</select>
								</td>
							</tr>
							<tr>
								<td>E-Mail</td>
								<td>
									<select class="uk-select" v-model="mapping.email" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }}: {{ attr }}</option>
									</select>
								</td>
							</tr>
							<tr>
								<td>Avatar</td>
								<td>
									<select class="uk-select" v-model="mapping.avatar" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }}: {{ attr }}</option>
									</select>
								</td>
							</tr>
							<tr>
								<td>Quota</td>
								<td>
									<select class="uk-select" v-model="mapping.quota" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }}: {{ attr }}</option>
									</select>
								</td>
							</tr>
							<tr>
								<td>Homedir</td>
								<td>
									<select class="uk-select" v-model="mapping.homeDir" name="">
										<option :value="key" v-for="(attr, key) in options.result">{{ key }}: {{ attr }}</option>
									</select>
								</td>
							</tr>
							<tr>
								<td>Distinguished Name</td>
								<td>cn=user,dc=example,dc=com</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
export default {
	props: ["users"],
	data () {
		return {
			expanded: true,
			options : {
				lookup: null,
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
	methods : {
		lookup () {
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
		}
	}
}
</script>
