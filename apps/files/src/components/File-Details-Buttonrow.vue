<template lang="pug">

	// --- pug mixin ----------------------------------------------------

	mixin icon(a)
		i.material-icons(class=a.class)= a.icon

	mixin iconButton(a)
		button.uk-button(class='uk-button-' + a.buttonType, class=a.class, type="button", @click=a.click).uk-flex.uk-flex-middle
			if a.text
				+icon({icon: a.icon, class: 'uk-margin-small-right'})
				span= a.text
			else
				+icon({icon: a.icon})

	// --- Vue component -----------------------------------------------

	.uk-button-group.uk-margin-medium-top
		+iconButton({class: 'uk-button-small', icon: 'file_download', buttonType: 'primary', text: 'Download', click: 'download()' })
		+iconButton({class: 'uk-button-small', icon: 'more_horiz', buttonType: 'default'})
		div(uk-dropdown="mode: click")
			.uk-margin
				select.uk-select
					option Copy Filename
					option Move Filename
			.uk-margin
				select.uk-select
					option into Games
					option into Books
					option into Music
			.uk-margin-top
				button.uk-button.uk-button-primary.uk-button-small.uk-width-1-1 Go

		template(v-if="this.$store.state.files.selected.length === 1")
			+iconButton({class: 'uk-button-small', icon: 'create', buttonType: 'default'})
		div(uk-dropdown="mode: click")
			.uk-margin
				input.uk-input(v-model="newName", placeholder="Name")
			.uk-margin-top
				button.uk-button.uk-button-primary.uk-button-small.uk-width-1-1(@click="renameItem(newName)") Update

		+iconButton({class: 'uk-button-small', icon: 'delete', buttonType: 'default'})
		div(uk-dropdown="mode: click")
			.uk-margin
				span Are you sure you want to delete Filename?
			.uk-margin-top
				button.uk-button.uk-button-danger.uk-button-small.uk-width-1-1(@click="deleteItems()") Delete
</template>
<script>
export default {
	props: ['files'],
	data() {
		return {
			fileAction: null,

			newName: ''
		}
	},
	methods: {
		download() {
			let files = this.$store.state.files.selected;

			for (let i = 0; i < files.length; i++) {
				this.$client.files.getFileContents(files[i].path).then(res => {
					var blob = new Blob([res]);
					var link = document.createElement('a');
					link.href = window.URL.createObjectURL(blob);
					link.download = files[i].name;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}).catch(err => {
					console.log(err);
				})
			}
		},
		deleteItems() {
			let files = this.$store.state.files.selected;

			for (let i = 0; i < files.length; i++) {
				this.$client.files.delete(files[i].path).then(res => {
					this.$store.dispatch('files/RESET_SELECTION');

					let parentFiles = this.$parent.$parent.$data.files;
					parentFiles.splice(
						parentFiles.indexOf(files[i]), 1
					);
				}).catch(err => {
					console.log(err);
				})
			}
		},
		renameItem(newName) {
			if(newName !== ''){
				let file = this.$store.state.files.selected[0];
				let pathSplit = file.path.split('/');
				let currentDirectory = pathSplit.slice(0, pathSplit[pathSplit.length - 1] === '' ? pathSplit.length - 2 : pathSplit.length - 1).join('/') + '/';

				let dest = currentDirectory + newName;
				if(file.type === 'file') {
					dest += '.' + file.path.split('/').splice(-1)[0].split('.').splice(-1)[0];
				}

				this.$client.files.move(file.path, dest).then(res => {
					this.$store.dispatch('files/RESET_SELECTION');
					this.$parent.$parent.$options.methods.loadFolder();

					let parentFiles = this.$parent.$parent.$data.files;
					parentFiles[parentFiles.indexOf(file)].name = newName;
				}).catch(err => {
					console.log(err);
				})
			}else {
				this.$uikit.notification({
					message: 'New name cannot be empty',
					status: 'danger',
					pos: 'top-center'
				});
			}
		}
	}
};
</script>
