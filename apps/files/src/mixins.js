import filesize from 'filesize';
import moment from 'moment';

export default {
	filters: {
		fileSize(int) {
			if (isNaN(int)) {
				return '???';
			}
			return filesize(int * 100, {
				round: 2
			});
		},
		formDateFromNow(date) {
			return moment(date).fromNow();
		},
		formDate(date) {
			return moment(date).format('MMMM Do YYYY');
		},
		formDateTime(date) {
			return moment(date).format('LLL');
		},
		ucFirst(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
	},
	methods: {
		label(string) {

			let cssClass = ['uk-label'];

			switch (parseInt(string)) {
				case 1:
					cssClass.push('uk-label-danger');
					break;
				case 2:
					cssClass.push('uk-label-warning');
					break;
				default:
					cssClass.push('uk-label-success');
			}

			return '<span class="' + cssClass.join(' ') + '">' + string + '</span>';
		},
		endOfDummy() {
			UIkit.notification({
				message: 'Not supported in the clickdummy',
				status: 'warning',
				pos: 'top-center'
			});
		}
	}
};
