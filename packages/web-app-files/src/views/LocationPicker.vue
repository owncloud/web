<template>
  <div class="uk-height-1-1 uk-flex uk-flex-column oc-p-s uk-overflow-hidden">
    <h1 class="location-picker-selection-info uk-flex uk-text-lead uk-margin-bottom">
      <span class="uk-margin-small-right" v-text="title" />
      <oc-breadcrumb :items="breadcrumbs" variation="lead" class="uk-text-lead" />
    </h1>
    <hr class="oc-mt-rm" />
    <div class="oc-mb">
      <oc-grid gutter="small">
        <div>
          <oc-button @click="leaveLocationPicker(originalLocation)">
            <translate>Cancel</translate>
          </oc-button>
        </div>
        <div>
          <oc-button
            id="location-picker-btn-confirm"
            variation="primary"
            :disabled="!canConfirm"
            @click="confirmAction"
          >
            <span v-text="confirmBtnText" />
          </oc-button>
        </div>
      </oc-grid>
    </div>
    <div>
      <list-loader v-if="state === 'loading'" />
      <oc-table-files
        v-else-if="state === 'loaded'"
        id="location-picker-files-list"
        :resources="activeFiles"
        :has-actions="false"
        :is-selectable="false"
        :disabled="disabledResources"
        :target-route="targetPath"
      />
      <no-content-message v-else-if="state === 'empty'" icon="folder">
        <template #message
          ><span v-translate>There are no resources in this folder.</span></template
        >
      </no-content-message>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions, mapGetters } from 'vuex'
import { basename, join } from 'path'

import { cloneStateObject } from '../helpers/store'
import MixinsGeneral from '../mixins'

import MoveSidebarMainContent from '../components/LocationPicker/MoveSidebarMainContent.vue'
import NoContentMessage from '../components/NoContentMessage.vue'
import CopySidebarMainContent from '../components/LocationPicker/CopySidebarMainContent.vue'

export default {
  components: {
    NoContentMessage
  },

  mixins: [MixinsGeneral],

  data: () => ({
    originalLocation: '',
    state: 'loading'
  }),

  computed: {
    ...mapState('Files', [
      'selectedResourcesForMove',
      'locationPickerTargetFolder',
      'currentFolder'
    ]),
    ...mapGetters('Files', [
      'activeFiles',
      'fileSortField',
      'fileSortDirectionDesc',
      'publicLinkPassword',
      'davProperties'
    ]),
    ...mapGetters(['user']),

    currentAction() {
      return this.$route.query.action
    },

    resources() {
      const resources = cloneStateObject(this.$route.query.resource)

      // In case there is only one resource, ensure that the return will still be an array
      if (typeof resources === 'string') {
        return [resources]
      }

      return resources
    },

    resourcesCount() {
      return this.resources.length
    },

    target() {
      return cloneStateObject(this.$route.query.target)
    },

    basePath() {
      return this.$route.path
    },

    resourcesQuery() {
      return (
        '&resource=' +
        this.resources.map(resource => encodeURIComponent(resource)).join('&resource=')
      )
    },

    isPublicPage() {
      return !this.user.id
    },

    breadcrumbs() {
      const breadcrumbs = []

      if (!this.isPublicPage) {
        breadcrumbs.push({
          index: 0,
          text: this.$gettext('Home'),
          to: this.basePath + `?action=${this.currentAction}&target=` + this.resourcesQuery
        })
      }

      if (this.target) {
        const items = this.target.split('/').filter(item => item !== '')

        for (let i = 0; i < items.length; i++) {
          const itemPath = encodeURIComponent(join.apply(null, items.slice(0, i + 1)))

          breadcrumbs.push({
            index: i + 1,
            text: items[i],
            to: this.createPath(itemPath)
          })
        }
      }

      delete breadcrumbs[breadcrumbs.length - 1].to

      return breadcrumbs
    },

    canConfirm() {
      return this.currentFolder && this.currentFolder.canCreate()
    },

    title() {
      const count = this.resourcesCount
      let title = ''

      if (this.currentAction === 'move') {
        title = this.$ngettext(
          'Selected %{ count } resource to move into:',
          'Selected %{ count } resources to move into:',
          count
        )
      } else if (this.currentAction === 'copy') {
        title = this.$ngettext(
          'Selected %{ count } resource to copy into:',
          'Selected %{ count } resources to copy into:',
          count
        )
      }

      return this.$gettextInterpolate(title, { count: count }, false)
    },

    confirmBtnText() {
      if (this.currentAction === 'move') {
        return this.$pgettext('Confirm action in the location picker for move', 'Move here')
      } else if (this.currentAction === 'copy') {
        return this.$pgettext('Confirm action in the location picker for copy', 'Paste here')
      }

      return this.$gettext('Confirm')
    },

    disabledResources() {
      const resources = cloneStateObject(this.activeFiles)

      return resources
        .filter(resource => resource.type !== 'folder' || this.resources.includes(resource.path))
        .map(resource => resource.id)
    },

    targetPath() {
      return (
        this.basePath +
        `?action=${encodeURIComponent(this.currentAction)}${this.resourcesQuery}&target=`
      )
    }
  },

  watch: {
    $route: {
      handler: 'navigateToTarget',
      immediate: true
    }
  },

  created() {
    this.originalLocation = this.target

    if (this.currentAction === 'move') {
      this.SET_NAVIGATION_HIDDEN(true)
      this.SET_MAIN_CONTENT_COMPONENT(MoveSidebarMainContent)
    } else if (this.currentAction === 'copy') {
      this.SET_NAVIGATION_HIDDEN(true)
      this.SET_MAIN_CONTENT_COMPONENT(CopySidebarMainContent)
    }
  },

  beforeDestroy() {
    this.SET_NAVIGATION_HIDDEN(false)
    this.SET_MAIN_CONTENT_COMPONENT(null)
  },

  methods: {
    ...mapMutations(['SET_NAVIGATION_HIDDEN', 'SET_MAIN_CONTENT_COMPONENT']),
    ...mapActions('Files', ['loadFiles', 'loadIndicators']),
    ...mapActions(['showMessage']),

    async navigateToTarget(target) {
      this.state = 'loading'

      if (typeof target === 'object') {
        target = this.target
      }

      const resources = await this.$client.files.list(target, 1, this.davProperties)

      this.loadFiles({ currentFolder: resources[0], files: resources.slice(1) })
      this.loadIndicators({ client: this.$client, currentFolder: this.$route.params.item || '/' })

      if (resources.length === 1) {
        this.state = 'empty'

        return
      }

      this.state = 'loaded'
    },

    leaveLocationPicker(target) {
      if (this.isPublicPage) {
        this.$router.push({ name: 'files-public-list', params: { token: target } })

        return
      }

      this.$router.push({ name: 'files-personal', params: { item: target || '/' } })
    },

    isRowDisabled(resource) {
      const isBeingMoved = this.resources.some(item => item === resource.path)

      return resource.type !== 'folder' || !resource.canCreate() || isBeingMoved
    },

    async confirmAction() {
      const errors = []
      let promise = null

      // Execute move or copy
      for (const resource of this.resources) {
        let target = this.target || '/'
        const resourceName = basename(resource)
        const exists = this.activeFiles.some(item => {
          return basename(item.name) === resourceName
        })

        if (exists) {
          const message = this.$gettext('Resource with name %{name} already exists')

          errors.push({
            resource: resourceName,
            message: this.$gettextInterpolate(message, { name: resourceName }, true)
          })

          continue
        }

        if (this.currentAction === 'move') {
          promise = this.isPublicPage
            ? this.$client.publicFiles.move(
                resource,
                (target += '/' + resourceName),
                this.publicLinkPassword
              )
            : this.$client.files.move(resource, (target += '/' + resourceName))
        } else if (this.currentAction === 'copy') {
          promise = this.isPublicPage
            ? this.$client.publicFiles.copy(
                resource,
                (target += '/' + resourceName),
                this.publicLinkPassword
              )
            : this.$client.files.copy(resource, (target += '/' + resourceName))
        }

        await promise.catch(error => {
          error.resource = resourceName
          errors.push(error)
        })
      }

      // Display error message
      if (errors.length === 1) {
        let title = ''

        if (this.currentAction === 'move') {
          title = this.$gettext('An error occurred while moving %{resource}')
        } else if (this.currentAction === 'copy') {
          title = this.$gettext('An error occurred while copying %{resource}')
        }

        this.showMessage({
          title: this.$gettextInterpolate(title, { resource: errors[0].resource }, true),
          desc: errors[0].message,
          status: 'danger',
          autoClose: {
            enabled: true
          }
        })

        return
      }

      if (errors.length > 1) {
        let title = ''
        let desc = ''

        if (this.currentAction === 'move') {
          title = this.$gettext('An error occurred while moving several resources')
          desc = this.$ngettext(
            '%{count} resource could not be moved',
            '%{count} resources could not be moved',
            errors.length
          )
        } else if (this.currentAction === 'copy') {
          title = this.$gettext('An error occurred while copying several resources')
          desc = this.$ngettext(
            '%{count} resource could not be copied',
            '%{count} resources could not be copied',
            errors.length
          )
        }

        this.showMessage({
          title,
          desc: this.$gettextInterpolate(desc, { count: errors.length }, false),
          status: 'danger',
          autoClose: {
            enabled: true
          }
        })
        console.error('Move / copy failed:', errors)

        return
      }

      this.leaveLocationPicker(this.target)
    },

    createPath(target) {
      return (
        this.basePath +
        `?action=${encodeURIComponent(this.currentAction)}&target=` +
        encodeURIComponent(target) +
        this.resourcesQuery
      )
    }
  }
}
</script>
