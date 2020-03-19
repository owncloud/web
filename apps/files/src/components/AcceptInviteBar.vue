<template>
  <div id="accept-invite-bar" class="oc-app-bar">
    <oc-grid flex gutter="small">
      <div class="uk-flex-1">
        <div class="uk-flex">
          <oc-breadcrumb id="files-breadcrumb" :items="breadcrumbs" v-if="showBreadcrumb" home></oc-breadcrumb>
        </div>
        <span class="uk-flex uk-flex-middle" v-if="!showBreadcrumb">
          <oc-icon v-if="pageIcon" :name="pageIcon" class="uk-margin-small-right" />
          <h1 class="oc-page-title" v-text="pageTitle" />
        </span>
        <span v-else-if="showBreadcrumb">
          <h1 class="oc-visually-hidden" v-text="pageTitle" />
        </span>
      </div>
    </oc-grid>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import pathUtil from 'path'

export default {
  computed: {
    ...mapGetters(['getToken', 'configuration']),
    ...mapGetters('Files', ['publicLinkPassword']),
    ...mapState(['route']),
    showBreadcrumb () {
      return (
        this.$route.name === 'public-files' || this.$route.name === 'files-list'
      )
    },
    pageIcon () {
      return this.$route.meta.pageIcon
    },
    pageTitle () {
      const title = this.route.meta.pageTitle
      return this.$gettext(title)
    },

    breadcrumbs () {
      let breadcrumbs = [
        {
          index: 0,
          text: this.$gettext('Home'),
          to: '/files/list'
        }
      ]

      if (!this.currentFolder) return breadcrumbs

      const rootFolder = this.configuration.rootFolder
      let baseUrl = '/files/list/'

      const pathSplit = this.currentFolder.path
        ? this.currentFolder.path.split('/').filter(val => {
          if (rootFolder === '/') return val

          return val !== rootFolder
        })
        : []

      if (rootFolder && rootFolder !== '/') {
        pathSplit.splice(0, 1)
        baseUrl = `/files/list/${rootFolder}%2F`
      }

      let startIndex = 0

      if (this.publicPage()) {
        baseUrl = '/files/public-files/'
        startIndex = 1
        breadcrumbs = [
          {
            index: 0,
            text: this.$gettext('Home'),
            to: baseUrl + pathSplit[0]
          }
        ]
      }

      for (let i = startIndex; i < pathSplit.length; i++) {
        let clickHandler = null
        let itemPath =
          baseUrl +
          encodeURIComponent(
            pathUtil.join.apply(null, pathSplit.slice(0, i + 1))
          )
        if (i === pathSplit.length - 1) {
          itemPath = null
          clickHandler = () => this.$router.go()
        }

        breadcrumbs.push({
          index: i,
          text: pathSplit.slice(0, i + 1)[i],
          to: itemPath,
          onClick: clickHandler
        })
      }

      return breadcrumbs
    }
  }
}
</script>
