<template lang="pug">
    div(uk-dropdown="pos: bottom-right; mode: click")
        ul.uk-nav.uk-dropdown-nav(v-if="shared.state == -1")
            li
                a
                    span.uk-flex.uk-flex-middle
                        i.material-icons.uk-margin-small-right check
                        | Accept Share
            li.uk-nav-divider
            li
                a
                    span.uk-flex.uk-flex-middle
                        i.material-icons.uk-margin-small-right mail
                        | Message sharee

        ul.uk-nav.uk-dropdown-nav(v-if="shared.state == 0")
            li
                a
                    span.uk-flex.uk-flex-middle
                        i.material-icons.uk-margin-small-right check
                        | Accept Share
            li
                a
                    span.uk-flex.uk-flex-middle
                        i.material-icons.uk-margin-small-right close
                        | Reject Share
            li.uk-nav-divider
            li
                a
                    span.uk-flex.uk-flex-middle
                        i.material-icons.uk-margin-small-right mail
                        | Message sharee

        ul.uk-nav.uk-dropdown-nav(v-if="shared.state == 1")
            li
                a
                    span.uk-flex.uk-flex-middle
                        i.material-icons.uk-margin-small-right close
                        | Remove Share
            li.uk-nav-divider
            li
                a
                    span.uk-flex.uk-flex-middle
                        i.material-icons.uk-margin-small-right share
                        | Share with others
            li
                a
                    span.uk-flex.uk-flex-middle
                        i.material-icons.uk-margin-small-right file_download
                        | Download
</template>
<script>
    export default {
        props  : ['shared']
    }
</script>
