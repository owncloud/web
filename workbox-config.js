module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{json,dist,css,gz,ttf,svg,png,html,js,txt,jpg}'
	],
	swDest: 'dist/sw.js',
  swSrc: "sw-runner.js"
};