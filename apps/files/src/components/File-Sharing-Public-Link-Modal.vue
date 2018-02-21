<template lang="pug">

    mixin formClickerItem(a)
        label(uk-grid).uk-grid-small
            .uk-width-auto
                input(type=a.type, name=a.name, value=a.value, style="margin-top:5px", class="uk-"+a.type)
            .uk-width-expand
                span.uk-h5= a.title
                br
                span.uk-text-small= a.description

    #file-sharing-modal(uk-modal)
        .uk-modal-dialog
            .uk-modal-header
                h3.uk-h3 Share {{ share.name }} with {{ recipient }}

            .uk-modal-body
                fieldset.uk-fieldset
                    .uk-form-controls.uk-form-controls-text.uk-margin-small-bottom
                        label.uk-text-lead File/Folder permissions:

                    .uk-form-controls.uk-form-controls-text.uk-margin-small-bottom.uk-margin-small-top
                        +formClickerItem({ type:"radio", name:"permission", value:"r",      title:"Read only",              description: "Users can view and download contents"})
                        +formClickerItem({ type:"radio", name:"permission", value:"r+w",    title:"Read & Write",           description: "Users can view, download, edit and upload contents."})
                        +formClickerItem({ type:"radio", name:"permission", value:"upload", title:"Upload only (filedrop)", description: "Receive files from others without revealing the contents of the folder."})

                    .uk-form-controls.uk-margin-small-bottom.uk-margin-medium-top
                        label.uk-text-lead Share permissions:

                    .uk-form-controls.uk-form-controls-text.uk-margin-small-bottom.uk-margin-small-top
                        +formClickerItem({ type:"checkbox", name:"shareWithOthers", title:"Share with users / groups", description: "Allow users to share this folder with users inside ownCloud"})
                        +formClickerItem({ type:"checkbox", name:"shareWithPublic", title:"Share with public", description: "Allow sharing with others using a public link or a federated share"})

                    .uk-form-controls.uk-form-controls-text.uk-margin-small-bottom.uk-margin-small-top
                        +formClickerItem({ type:"checkbox", name:"sendNotification", title:"Send notification", description: "The recipient will be notified about this share via email"})

                    .uk-form-controls.uk-margin-small-bottom.uk-margin-medium-top
                        label.uk-text-lead Set expiration date:

                    .uk-form-controls.uk-form-controls-text.uk-margin-small-bottom.uk-margin-small-top
                        .uk-inline
                            i.material-icons date_range
                            input.uk-input(type="input", v-model="expires")

                        p.uk-text-small
                            span This share will expire {{ expires | formDateFromNow }}

                    .uk-form-controls.uk-margin-medium-top
                        label.uk-text-lead Send mail notification

                    .uk-form-controls.uk-margin-small-top
                        input.uk-input(type="email", placeholder="E-Mail-Recipient(s)")

                    .uk-form-controls.uk-margin-small-top
                        textarea.uk-textarea(placeholder="Your Message", rows="3")

                    .uk-form-controls.uk-form-controls-text.uk-margin-small-top
                        +formClickerItem({ type:"checkbox", name:"bccToSelf", title:"Send copy to self", description: "Allow users to share this folder with users inside ownCloud"})


            .uk-modal-footer
                    button.uk-button.uk-button-small.uk-button-default.uk-modal-close Cancel
                    button.uk-button.uk-button-small.uk-button-primary.uk-align-right.uk-modal-close.uk-margin-remove-bottom Save
</template>
<script>
    import Mixins  from '../mixins';

    export default {
        mixins : [Mixins],
        props  : ['share'],
        data () {
            return {
                recipient: "",
                expires: '12/31/2017'
            }
        },
        mounted() {
            UIkit.util.on('#file-sharing-modal', 'shown', function () {
                // $('#mailto').tagsInput();
            });
        },
        methods: {
            createShare() {
                let hash = Math.random().toString(32).substring(2, 15);

                this.share.sharedOut.push({
                    'type'   : 'public',
                    'name'   : hash,
                    'perms'  : 'Write only',
                });
                this.recipient = '';
            }
        }
    }
</script>
