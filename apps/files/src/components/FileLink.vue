<template>
  <div id="oc-files-file-link">
    <FileLinkForm v-if="formOpen" v-bind:params="params" :linkId="linkId" />
    <div class="uk-text-right">
      <oc-button v-if="!formOpen" variation="primary" icon="add" @click="openForm()" translate>Add Link</oc-button>
    </div>
    <ul class="uk-list uk-list-divider">
      <li v-if="linksLoading" class="uk-flex uk-flex-middle">
        <oc-spinner class="uk-margin-small-right" /> <span class="uk-text-meta">Loading Shares</span>
      </li>
      <li v-for="(link, index) in $_links" :key="index">
        <oc-grid flex gutter="small">
          <div class="uk-width-auto">
            <oc-icon name="link" class="uk-icon-button" />
          </div>
          <div class="uk-width-expand">
            <span class="uk-text-bold">{{ link.token }}</span><br>
            <span class="uk-text-meta">{{ link.description }} | Expires {{ formDateFromNow(link.expiration) }}</span>
          </div>
          <div class="uk-width-auto uk-button-group">
            <oc-button icon="edit" @click="_editLink(link)"/>
            <oc-button icon="delete" @click="_removeLink(link)" />
          </div>
        </oc-grid>
        <FileLinkForm v-if="linkId === link.id" class="uk-margin-top" v-bind:params="params" :context="'edit'" :linkId="linkId"/>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import mixins from '../mixins'

import FileLinkForm from './FileLinkForm.vue'

export default {
  mixins: [mixins],
  components: { FileLinkForm },
  title: ($gettext) => {
    return $gettext('Links')
  },
  data () {
    return {
      // Render template only when needed
      formOpen: false,
      linkId: false,

      // group for easy payload
      params: {
        name: '',
        permissions: 1,
        password: '',
        expireDate: null
      }
    }
  },
  mounted () {
    if (this.highlightedFile) {
      this.loadLinks({
        client: this.$client,
        path: this.highlightedFile.path
      })
    } else {
      this.purgeLinks()
    }

    this.$root.$on('oc-files-file-link', e => {
      switch (e.action) {
        case 'cancelLinkCreation' :
        case 'closeForm' :
          this.closeForm()
          break
      }
    })
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'links', 'linksLoading', 'linksError']),
    ...mapGetters(['getToken', 'capabilities']),

    $_links () {
      return this.links.filter(link => {
        return parseInt(link.itemSource) === parseInt(this.highlightedFile.id)
      })
    },

    expirationDate () {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      return {
        enabled: !!expireDate.enabled,
        days: (expireDate.days) ? expireDate.days : false,
        enforced: expireDate.enforced === '1'
      }
    }
  },
  methods: {
    ...mapActions('Files', ['loadLinks', 'purgeLinks', 'removeLink']),
    resetData () {
      this.params = {
        name: this.capabilities.files_sharing.public.defaultPublicLinkShareName,
        permissions: 1,
        password: '',
        expireDate: (this.expirationDate.days) ? moment().add(this.expirationDate.days, 'days').format('YYYY-MM-DD') : null
      }
    },
    _removeLink (link) {
      this.removeLink({
        client: this.$client,
        id: link.id
      })
    },
    _editLink (link) {
      this.linkId = link.id
      this.params = {
        name: 'Name (API MISSING)',
        perms: parseInt(link.permissions),
        password: '****',
        expireDate: moment(link.expiration).format('YYYY-MM-DD')
      }
    },
    openForm () {
      this.formOpen = true
      this.resetData()
    },
    closeForm () {
      this.formOpen = false
      this.linkId = false
    }
  }
}
</script>
