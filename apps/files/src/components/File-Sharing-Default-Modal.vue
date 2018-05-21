<template lang="pug">

    mixin formClickerItem(a)
        label(uk-grid).uk-grid-small
            .uk-width-auto
                input(type=a.type, name=a.name, value=a.value, style="margin-top:5px", class="uk-"+a.type, v-model=a.model)
            .uk-width-expand
                span.uk-h5= a.title
                br
                span.uk-text-small= a.description

    #file-sharing-default-modal(uk-modal)
        .uk-modal-dialog
            .uk-modal-header
                h3.uk-h3 Share {{ filename }} with {{ share.recipient }}

            .uk-modal-body
                fieldset.uk-fieldset
                    .uk-form-controls.uk-form-controls-text.uk-margin-small-bottom
                        label.uk-text-lead File/Folder permissions:

                    .uk-form-controls.uk-form-controls-text.uk-margin-small-bottom.uk-margin-small-top
                        +formClickerItem({ type:"checkbox", name:"permission", model:"share.canCreate", title:"Can Create", description: "Users create new files and folders."})
                        +formClickerItem({ type:"checkbox", name:"permission", model:"share.canChange", title:"Can Change", description: "Users can view, download, edit and upload contents."})
                        +formClickerItem({ type:"checkbox", name:"permission", model:"share.canDelete", title:"Can Delete", description: "Users can remove files and folders."})

                    .uk-form-controls.uk-margin-small-bottom.uk-margin-medium-top
                        label.uk-text-lead Share permissions:

                    .uk-form-controls.uk-form-controls-text.uk-margin-small-bottom.uk-margin-small-top
                        +formClickerItem({ type:"checkbox", model:"share.canShare", name:"shareWithOthers", title:"Share with users / groups", description: "Allow users to share this folder with users inside ownCloud"})
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

            .uk-modal-footer
                    button.uk-button.uk-button-small.uk-button-default.uk-modal-close Cancel
                    button(@click="share.send = true").uk-button.uk-button-small.uk-button-primary.uk-align-right.uk-modal-close.uk-margin-remove-bottom Save
</template>
<script>
    import Mixins  from '../mixins';

    export default {
        mixins : [Mixins],
        props  : ['share', 'recipient', 'filename'],
        data () {
            return {
                expires: '12/31/2017'
            }
        },
        mounted() {
            OC.$uikit.util.on('#file-sharing-modal', 'hide', function () {
                // $('#mailto').tagsInput();
            });
        },
        methods: {
            createShare() {
                this.$parent.$options.methods.createPublicShare()
            }
        }
    }
</script>
