const { client } = require('nightwatch-api');
const { Given, Then, When } = require('cucumber');

When('the user browses to the files page',
	() => {
        const filesPage = client
            .windowHandles(function(result) {
                this.switchWindow(result.value[0]);
            })
            .page.filesPage();
		return filesPage
		.navigate()
	});
