import '@babel/polyfill'

// --- Components --------------------------------------------------------------

const MarkdownEditor = () => ({
	component: import ('./MarkdownEditor.vue')
});


// --- Routing -----------------------------------------------------------------

const routes = [{
	path: '',
	component: MarkdownEditor,
	name: 'markdown-editor'
}];


const appInfo = {
	name: 'Markdown Editor',
	id: 'markdown-editor',
	icon: 'ocft icon-x-office-document',
	isFileEditor: true,
	extensions: [{
		extension: 'txt'
	},
	{
		extension: 'md'
		// icon: 'custom_icon_class_to_override_icon_for_filetype_md'
	}
]}

export default define({
	appInfo,
	routes
})
