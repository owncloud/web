var helper = {
	methods: {
		/**
		 * Create random string
		 * will start with "c4…"
		 *
		 * @param prefix any string, number
		 * @return 16 char string
		 */

		createRandom(prefix = '') {
			// will always start with "c4…"
			return prefix + btoa(Math.random()).toLowerCase().substring(1, 17);
		}
	}
}

export default helper;
