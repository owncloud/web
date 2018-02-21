<template lang="pug">
    .uk-grid-small(uk-grid)
        .uk-width-1
            .uk-grid-small(uk-grid)
                .uk-width-expand
                    input.uk-input(type='text', placeholder='User-, Groupname or E-Mail', v-model="recipient")
                .uk-width-auto
                    .uk-button-group
                        button.uk-button.uk-button-primary(@click="createDefaultShare", :disabled="recipient.length === 0")
                            span(class="uk-hidden@m") &gt;
                            span(class="uk-visible@s") Share
                        button.uk-button.uk-button-primary.uk-button-material(:disabled="recipient.length === 0", style="padding:0 4px;")
                            i.material-icons arrow_drop_down
                        div(uk-dropdown="pos:bottom-right; mode: click")
                            fieldset.uk-fieldset
                                .uk-form-controls
                                    label
                                        input.uk-checkbox(type="checkbox", v-model="defaultShare.canShare").uk-margin-small-right
                                        span.uk-text-meta Can Share
                                .uk-form-controls.uk-margin-small-top
                                    label
                                        input.uk-checkbox(type="checkbox", name="p", v-model="defaultShare.canCreate").uk-margin-small-right
                                        span.uk-text-meta Can create
                                .uk-form-controls.uk-margin-small-top
                                    label
                                        input.uk-checkbox(type="checkbox", name="p", v-model="defaultShare.canChange").uk-margin-small-right
                                        span.uk-text-meta Can change Files
                                .uk-form-controls.uk-margin-small-top
                                    label
                                        input.uk-checkbox(type="checkbox", name="p", v-model="defaultShare.canDelete").uk-margin-small-right
                                        span.uk-text-meta Can delete
                            .uk-margin-small-top
                                a.uk-link.uk-text-small(@click="openDefaultModal") More options

        //- .uk-width-1.uk-text-right
            a(href="").uk-link create a public link

        .uk-width-1
            ul.uk-list.uk-list-divider.uk-margin-top
                li.oc-shared-item(v-for="s, sid in share.sharedOut")
                    .uk-grid-small.uk-flex-middle(uk-grid)
                        .uk-width-auto
                            img(v-if="s.type === 'default'", width="40", height="40", :src="s.avatar").uk-border-circle
                            div(v-else-if="s.type === 'public'").oc-public-share-icon
                                i(v-if="s.password").material-icons lock
                                i(v-else).material-icons link
                            div(v-else-if="s.type === 'federated'").oc-public-share-icon
                                i.material-icons person_outline
                        .uk-width-expand
                            h3.uk-h5.uk-margin-remove-bottom {{ s.name }}
                            p(v-html="formatPerms(s.perms)").uk-text-meta.uk-margin-remove-top._csv
                        .uk-width-auto
                            section.uk-button-group
                                button(v-if="s.type === 'public'").uk-button.uk-button-small.uk-button-default.uk-button-material
                                    i.material-icons content_paste
                                button.uk-button.uk-button-small.uk-button-default.uk-button-material
                                    i.material-icons settings
                                button.uk-button.uk-button-small.uk-button-default.uk-button-material(@click="removeShare(sid)")
                                    i.material-icons delete

        //- MODAL
        public-link-modal(:share="defaultShare")
        standard-modal(:share="defaultShare", :recipient="recipient", :filename="share.name")
</template>
<script>
    import Mixins          from '../mixins';
    import PublicLinkModal from './File-Sharing-Public-Link-Modal.vue';
    import DefaultModal    from './File-Sharing-Default-Modal.vue';

    export default {
        mixins : [Mixins],
        components: {
            'public-link-modal' : PublicLinkModal,
            'standard-modal'     : DefaultModal
        },
        props  : ['share'],
        data () {
            return {
                recipient : "",
                defaultShare: {
                    canShare: false,
                    canCreate: true,
                    canChange: true,
                    canDelete: true
                },
            }
        },
        mounted() {
            UIkit.util.on('#file-sharing-modal', 'shown', function () {
                // $('#mailto').tagsInput();
            });
        },
        methods: {
            createDefaultShare() {
                this.share.sharedOut.push({
                    'type'   : 'default',
                    'avatar' : 'https://picsum.photos/40/40/?random',
                    'name'   : this.recipient,
                    'perms'  : {
                        'canShare'  : this.defaultShare.canShare,
                        'canCreate' : this.defaultShare.canCreate,
                        'canChange' : this.defaultShare.canChange,
                        'canDelete' : this.defaultShare.canDelete
                    },
                });
                this.recipient = '';
            },
            openPublicLinkModal () {
                UIkit.modal('#file-sharing-modal').show();
            },
            openDefaultModal () {
                UIkit.modal('#file-sharing-default-modal').show();
            },
            formatPerms(perms) {
                let string = "";
                if (perms.canShare)  string += "<span>Share</span>";
                if (perms.canCreate) string += "<span>Create</span>";
                if (perms.canChange) string += "<span>Change</span>";

                return string
            },
            removeShare(id) {
                this.share.sharedOut.splice(id, 1);
            }
        }
    }
</script>
<style lang="sass">
._csv {
    span + span:before {
        content: ", "
    }

    span + span:last-of-type:before {
        content: " & "
    }
}
</style>
