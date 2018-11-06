const chromedriver = require('chromedriver');

module.exports = {
	page_objects_path : './tests/acceptance/pageObjects',
	test_settings: {
		local: {
			launch_url : 'http://localhost:8300',
			webdriver: {
				start_process: true,
				server_path: chromedriver.path,
				port: 4445,
				cli_args: ['--port=4445']
			},
			desiredCapabilities: {
				browserName: 'chrome',
				javascriptEnabled: true,
				acceptSslCerts: true,
				chromeOptions: {
					args: ['disable-gpu']
				}
			}
		},
		drone: {
			launch_url : 'http://phoenix:8300',
			selenium_host: 'selenium',
			webdriver: {
				start_process: false
			},
			desiredCapabilities: {
				browserName: 'chrome',
				javascriptEnabled: true,
				acceptSslCerts: true,
				chromeOptions: {
					args: ['disable-gpu']
				}
			}
		},
	}
};