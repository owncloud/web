<template lang="pug">

    mixin formClickerItem(a)
        label(uk-grid).uk-grid-small
            .uk-width-auto
                input(type=a.type, value=a.value, style="margin-top:5px", class="uk-"+a.type, v-model=a.model)
            .uk-width-expand
                span.uk-h5= a.title
                br
                span.uk-text-small= a.description

    #file-sharing-modal(uk-modal)
        .uk-modal-dialog
            .uk-modal-header
                h3.uk-h3 Create Link for {{ share.name }}

            .uk-modal-body
                fieldset.uk-fieldset
                    h3.uk-h4.uk-heading-divider File/Folder permissions:
                    +formClickerItem({ type:"radio", value:1, model: "share.permissions", title:"Read only",              description: "Users can view and download contents"})
                    +formClickerItem({ type:"radio", value:4, model: "share.permissions", title:"Read & Write",           description: "Users can view, download, edit and upload contents."})
                    +formClickerItem({ type:"radio", value:2, model: "share.permissions", title:"Upload only (filedrop)", description: "Receive files from others without revealing the contents of the folder."})

                    section.uk-margin-medium-top
                        h3.uk-h4.uk-heading-divider Security settings
                        .uk-margin-small-top.uk-grid-small(uk-grid)
                            .uk-width-1-2
                                .uk-inline.uk-width-1
                                    i.material-icons date_range
                                    input.uk-input(type="input", v-model.lazy="share.expires", placeholder="Set expiry (optional)")
                                span(v-if="expires").uk-text-meta This share will expire {{ expires | formDateFromNow }}
                            .uk-width-1-2
                                .uk-inline.uk-width-1
                                    i.material-icons lock_outline
                                    input.uk-input(type="password", v-model.lazy="share.password", placeholder="Password (optional)")
                                span(v-if="password").uk-text-meta This password is totaly bogus since you are going to put it in an email anyways so don't bother

                    section.uk-margin-medium-top
                        h3.uk-h4.uk-heading-divider Send mail notification

                        .uk-margin-small-top
                            input.uk-input(type="email", v-model="share.mail.to", placeholder="E-Mail-Recipient(s)")

                        .uk-margin-small-top
                            textarea.uk-textarea(placeholder="Your Message", v-model="share.mail.body", :disabled="!share.mail.to", :rows="!share.mail.to ? '2' : '4'")

                        .uk-margin-small-top
                            label
                                input(type="checkbox", :disabled="!share.mail.bcc").uk-checkbox
                                span.uk-text-small.uk-margin-small-left Send a copy to myself

            .uk-modal-footer
                    button.uk-button.uk-button-small.uk-button-default.uk-modal-close Cancel
                    button(@click="share.send = true").uk-button.uk-button-small.uk-button-primary.uk-align-right.uk-modal-close.uk-margin-remove-bottom Save
</template>
<script>
    import Mixins  from '../mixins';

    export default {
        mixins : [Mixins],
        props  : ['share','filename']
    }
</script>
