<template lang="pug">
    div(data-component="file-sharing")
        ul(uk-switcher="connect: #switch-int-ext").uk-child-width-expand.uk-tab.uk-tab-bottom
            li
                a(href="") User/Group
            li
                a(href="") Public Link

        ul#switch-int-ext.uk-switcher
            li
                //- Users and groudps
                .uk-grid-small(uk-grid, v-if="defaultShare")
                    .uk-width-1
                        .uk-grid-small(uk-grid)
                            .uk-width-expand
                                input.uk-input(type='text', placeholder='User-, Groupname or E-Mail', v-model="defaultShare.recipient")#foo
                            .uk-width-auto
                                .uk-button-group
                                    button.uk-button.uk-button-primary(@click="createDefaultShare", :disabled="defaultShare.recipient.length === 0")
                                        span(class="uk-hidden@m") &gt;
                                        span(class="uk-visible@s") Share
                                    button.uk-button.uk-button-primary.uk-button-material(:disabled="defaultShare.recipient.length === 0", style="padding:0 4px;")
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
            li
                //- External Links
                .uk-grid-small(uk-grid, v-if="linkShare")
                    .uk-width-1
                        .uk-grid-small(uk-grid)
                            .uk-width-expand
                                input.uk-input(type='mail', placeholder='E-Mail-Address (optional)', v-model="linkShare.mail.to", :style="linkShare.mail.to ? 'text-transform:lowercase' : ''")
                            .uk-width-auto
                                .uk-button-group
                                    button.uk-button.uk-button-primary(@click="createLinkShare")
                                        span(class="uk-hidden@m") &gt;
                                        span(class="uk-visible@s") {{ linkShare.mail.to ? 'Send Link' : 'Create Link' }}
                                    button.uk-button.uk-button-primary.uk-button-material(@click="openPublicLinkModal", style="padding:0 4px;")
                                        i.material-icons settings

        //- .uk-width-1.uk-text-right
            a(href="").uk-link create a public link

        .uk-width-1
            ul.uk-list.uk-list-divider.uk-margin-top
                li.oc-shared-item(v-for="su, suid in share.shared.to.user")
                    .uk-grid-small.uk-flex-middle(uk-grid)
                        .uk-width-auto
                            img(width="40", height="40", :src="su.avatar").uk-border-circle
                        .uk-width-expand
                            h3.uk-h5.uk-margin-remove-bottom {{ su.name }}
                            //- p(v-html="formatPerms(s.perms)").uk-text-meta.uk-margin-remove-top._csv
                        .uk-width-auto
                            section.uk-button-group
                                button.uk-button.uk-button-small.uk-button-default.uk-button-material
                                    i.material-icons settings
                                button.uk-button.uk-button-small.uk-button-default.uk-button-material(@click="removeShare(suid, 'user')")
                                    i.material-icons delete
                li.oc-shared-item(v-for="sl, slid in share.shared.to.link")
                    .uk-grid-small.uk-flex-middle(uk-grid)
                        .uk-width-auto
                            .oc-public-share-icon
                                i(v-if="sl.password").material-icons lock
                                i(v-else).material-icons link
                        .uk-width-expand
                            h3.uk-h5.uk-margin-remove-bottom.uk-text-truncate
                                span(v-if="sl.mailTo.length > 0") {{ sl.mailTo }}
                                span(v-else) {{ sl.hash }}
                            //- p(v-html="formatPerms(s.perms)").uk-text-meta.uk-margin-remove-top._csv
                        .uk-width-auto
                            section.uk-button-group
                                button.uk-button.uk-button-small.uk-button-default.uk-button-material
                                    i.material-icons content_paste
                                button.uk-button.uk-button-small.uk-button-default.uk-button-material
                                    i.material-icons settings
                                button.uk-button.uk-button-small.uk-button-default.uk-button-material(@click="removeShare(slid, 'link')")
                                    i.material-icons delete

        //- MODAL
        public-link-modal(:share="linkShare", :filename="share.name")
        standard-modal(:share="defaultShare", :filename="share.name")
</template>
<script>
    import Mixins          from '../mixins';
    import PublicLinkModal from './File-Sharing-Public-Link-Modal.vue';
    import DefaultModal    from './File-Sharing-Default-Modal.vue';

    export default {
        mixins : [Mixins],
        components: {
            'public-link-modal' : PublicLinkModal,
            'standard-modal'    : DefaultModal
        },
        props  : ['share'],
        data () {
            return {
                users: {},
                defaultShare: {
                    recipient : "",
                    canShare  : false,
                    canCreate : true,
                    canChange : true,
                    canDelete : true
                },
                linkShare: {
                    permissions : 4,
                    expires     : "",
                    password    : "",
                    send        : false,
                    mail        : {
                        to      : "",
                        body    : "",
                        bcc     : false
                    }
                }
            }
        },
        mounted() {

            this.resetDefaultShare();
            this.resetLinkShare();

            OC.$uikit.util.on('#file-sharing-modal', 'hide', () => {
                if (this.linkShare.send) {
                    this.createLinkShare();
                }
            });
        },
        methods: {
            createDefaultShare() {
                this.share.shared.to.user.push({
                    'type'   : 'default',
                    'avatar' : 'https://picsum.photos/40/40/?random',
                    'name'   : this.defaultShare.recipient,
                    'perms'  : {
                        'canShare'  : this.defaultShare.canShare,
                        'canCreate' : this.defaultShare.canCreate,
                        'canChange' : this.defaultShare.canChange,
                        'canDelete' : this.defaultShare.canDelete
                    },
                });
                this.resetDefaultShare();
            },
            createLinkShare() {
                this.share.shared.to.link.push({
                    'hash'        : this.createToken(),
                    'type'        : 'link',
                    'mailTo'      : this.linkShare.mail.to.toLowerCase(),
                    'mailBody'    : this.linkShare.mail.body,
                    'permissions' : this.linkShare.permissions,
                    'expires'     : this.linkShare.expires,
                    'password'    : this.linkShare.password,
                });

                OC.$uikit.notification({
                    message : (this.linkShare.mail.to) ? "Link has been send to " + this.linkShare.mail.to : "Link has been created",
                    status  : 'success',
                    pos     : 'top-center'
                });

                this.resetLinkShare();
            },
            openPublicLinkModal () {
                OC.$uikit.modal('#file-sharing-modal').show();
            },
            openDefaultModal () {
                OC.$uikit.modal('#file-sharing-default-modal').show();
            },
            formatPerms(perms) {
                let string = "";
                if (perms.canShare)  string += "<span>Share</span>";
                if (perms.canCreate) string += "<span>Create</span>";
                if (perms.canChange) string += "<span>Change</span>";

                return string
            },
            removeShare(id, type) {
                this.share.shared.to[type].splice(id, 1);
            },
            createToken() {
                return Math.random().toString(32).substring(2, 15);
            },
            resetDefaultShare() {
                this.defaultShare = {
                    recipient : "",
                    canShare  : false,
                    canCreate : true,
                    canChange : true,
                    canDelete : true
                }
            },
            resetLinkShare() {
                this.linkShare = {
                    permissions : 4,
                    expires     : "",
                    password    : "",
                    send        : false,
                    mail        : {
                        to      : "",
                        body    : "",
                        bcc     : false
                    }
                }
            }
        }
    }
</script>
<style lang="less">
._csv {
    span + span:before {
        content: ", "
    }

    span + span:last-of-type:before {
        content: " & "
    }
}
</style>
