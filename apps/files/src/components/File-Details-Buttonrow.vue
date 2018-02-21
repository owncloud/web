<template lang="pug">

    // --- pug mixin ----------------------------------------------------

    mixin icon(a)
        i.material-icons(class=a.class)= a.icon

    mixin iconButton(a)
        button.uk-button(class='uk-button-' + a.buttonType, class=a.class, type="button").uk-flex.uk-flex-middle
            if a.text
                +icon({icon: a.icon, class: 'uk-margin-small-right'})
                span= a.text
            else
                +icon({icon: a.icon})

    // --- Vue component -----------------------------------------------

    .uk-button-group.uk-margin-medium-top
        +iconButton({class: 'uk-button-small', icon: 'file_download', buttonType: 'primary', text: 'Download' })
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
                    option into Musik
            .uk-margin-top
                button.uk-button.uk-button-primary.uk-button-small.uk-width-1-1 Go

        +iconButton({class: 'uk-button-small', icon: 'delete', buttonType: 'default'})
        div(uk-dropdown="mode: click")
            .uk-margin
                span Are you sure you want to delete Filename?
            .uk-margin-top
                button.uk-button.uk-button-danger.uk-button-small.uk-width-1-1 Delete
</template>
<script>
    export default {
        data () {
            return {
                fileAction: null
            }
        }
    }
</script>