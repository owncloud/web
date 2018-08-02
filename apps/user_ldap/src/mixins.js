export default {
	filters : {
		fileSize(int) {
			return filesize(int * 100, {
				round: 2
			});
		},
		formDateFromNow(date) {
			return moment(date).fromNow();
		},
		formDate(date) {
			return moment(date).format('MMMM Do YYYY')
		},
		formDateTime(date) {
			return moment(date).format('LLL')
		},
		ucFirst(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
	},
	methods : {
		endOfDummy () {
			UIkit.notification({
				message: 'Not supported in the clickdummy',
				status: 'warning',
				pos: 'top-center'
			});
		}
	}
}
