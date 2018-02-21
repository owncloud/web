<template lang="pug">
    // material icon mixin
    mixin icon(a)
        i.material-icons(class=a.class)= a.icon

    #file-details.uk-position-relative
        button(type="button", uk-close, @click="close").uk-position-top-right
        section(v-if="file.length === 1")
            .uk-grid-small.uk-flex-middle(uk-grid)
                .uk-width-auto
                    i.material-icons.-x2 {{ file[0].type }}

                .uk-width-expand
                    h3.uk-card-title.uk-margin-remove-bottom.uk-text-truncate {{ file[0].name }}
                        span(uk-icon="icon: link", uk-tooltip, title="Copy local link", style="cursor:pointer").uk-margin-small-left

                    p.uk-margin-remove-top
                        span.uk-text-meta Size:&nbsp;
                        span.uk-text-small {{ file[0].size | fileSize }}

            FileDetailsButtonrow

            ul(uk-switcher="connect: #hou2ifelkje").uk-child-width-expand.uk-tab
                li.uk-active
                    a(href="") Info
                li
                    a(href="") Sharing
                li
                    a(href="") More
                    ul(uk-dropdown="mode: click").uk-nav.uk-dropdown-nav
                        li
                            a(href="") Activity
                        li
                            a(href="") Some Plugin

            ul#hou2ifelkje.uk-switcher
                li
                    .uk-overflow-hidden
                        table.uk-table.uk-table-small.uk-text-meta
                            tbody
                                tr
                                    td Modified:
                                    td.uk-table-expand {{ file[0].mdate | formDateTime }}
                                tr.uk-padding-bottom-small
                                    td Created:
                                    td.uk-table-expand {{ file[0].cdate | formDateTime }}
                                tr(v-for="(meta, key) in file[0].meta")
                                    td {{ key | ucFirst }}:
                                    td.uk-table-expand {{ meta }}

                li
                    FilesSharing(:share="file[0]")

        section(v-else-if="file.length > 1")
            .uk-grid-small.uk-flex-middle(uk-grid)
                .uk-width-auto
                    i.material-icons.-x2 filter_{{ file.length }}

                .uk-width-expand
                    h3.uk-card-title.uk-margin-remove-bottom.uk-text-truncate Multiple files
                        span(uk-icon="icon: link", uk-tooltip, title="Copy local link", style="cursor:pointer").uk-margin-small-left

                    p.uk-margin-remove-top
                        span.uk-text-meta Size:&nbsp;
                        span.uk-text-small {{ accumulatedFilesSize | fileSize }}

            FileDetailsButtonrow

            hr.uk-hr
            ul.uk-list.uk-list-bullet
                li(v-for="item in file") {{ item.name }}
                    span(v-if="item.extension").uk-text-meta .{{ item.extension }}
</template>

<script>
    import Mixins  from '../mixins';

    // vue components
    import FilesSharing         from './File-Sharing.vue';
    import FileDetailsButtonrow from './File-Details-Buttonrow.vue';

    export default {
        mixins     : [Mixins],
        props      : ['file'],
        components : {
            FilesSharing,
            FileDetailsButtonrow
        },
        data () {
            return {
                recipient : ""
            }
        },
        methods : {
            close () {
                this.$emit('reset');
            }
        },
        computed   : {
            accumulatedFilesSize () {
                let size = 0;

                _.each(this.file, (e) => {
                    size = size + e.size
                });

                return size;
            }
        }
    }
</script>

<style lang="scss">
    .material-icons {
        user-select: none;

        &.-x2 {
            font-size: 48px;
        }
    }

    .uk-button-small .material-icons {
        font-size: 16px;
    }
</style>
