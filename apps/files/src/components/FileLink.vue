<template>
  <div id="oc-files-file-link">
    <oc-button variation="primary" icon="add" uk-toggle="target: #oc-files-file-link-modal" @click="resetData(); showTemplate = true" translate>Add Link</oc-button>
    <div id="oc-files-file-link-modal" uk-modal class="uk-flex-top" v-if="showTemplate">
      <div class="uk-modal-dialog uk-margin-auto-vertical">
        <button class="uk-modal-close" type="button"></button>
        <div class="uk-modal-header">
          <h3 class="uk-text-truncate">{{ highlightedFile.name }}</h3>
          <span>Share with the world because sharing is caring and stuff.</span>
        </div>
        <div class="uk-modal-body" uk-overflow-auto>
          <div class="uk-margin">
            <label class="uk-form-label" v-translate>Name your link</label>
            <input class="uk-input" v-model="params.name" />
          </div>
          <h4 class="uk-margin-medium-top uk-heading-divider">
            File permissions
          </h4>

          <!----------
            | VIEWER |
            ---------->
          <div class="uk-margin uk-grid-small" uk-grid>
            <div class="uk-width-auto">
              <input type="radio" class="uk-radio" v-model="params.permissions" value="1" />
            </div>
            <label class="uk-width-expand" @click="params.permissions = 1">
              <span>Viewer</span><br>
              <span class="uk-text-meta">Download / View</span>
            </label>
          </div>

          <!----------
            | EDITOR |
            ---------->
          <div class="uk-margin uk-grid-small" uk-grid>
            <div class="uk-width-auto">
              <input type="radio" class="uk-radio" v-model="params.permissions" value="15" />
            </div>
            <label class="uk-width-expand" @click="params.permissions = 15">
              <span>Editor</span><br>
              <span class="uk-text-meta">Download / View / Edit</span>
            </label>
          </div>

          <!---------------
            | CONTRIBUTOR |
            --------------->
          <div v-if="isFolder" class="uk-margin uk-grid-small" uk-grid>
            <div class="uk-width-auto">
              <input type="radio" class="uk-radio" v-model="params.permissions" value="5" />
            </div>
            <label class="uk-width-expand" @click="params.permissions = 5">
              <span v-translate>Contributor</span><br>
              <span class="uk-text-meta">Download / View / Upload</span>
            </label>
          </div>

          <!------------
            | UPLOADER |
            ------------>
          <div v-if="isFolder" class="uk-margin uk-grid-small" uk-grid>
            <div class="uk-width-auto">
              <input type="radio" class="uk-radio" v-model="params.permissions" value="4" />
            </div>
            <label class="uk-width-expand" @click="params.permissions = 4">
              <span v-translate>Uploader</span><br>
              <span class="uk-text-meta">File Drop</span>
            </label>
          </div>

          <h4 class="uk-margin-medium-top uk-heading-divider">
            Security settings
          </h4>
          <div class="uk-margin uk-grid-small uk-flex uk-flex-middle" uk-grid>
            <div v-if="expirationDate" class="uk-width-1-1 uk-width-2-5@m">
              <label class="uk-form-label" for="">Expiration date<em v-if="expirationDate.enforced" class="uk-margin-small-left">(required)</em></label>
              <input type="text" class="uk-input" v-model="params.expireDate" />
            </div>
            <div class="uk-width-1-1 uk-width-3-5@m">
              <label class="uk-form-label" for="">Password<em v-if="passwordEnforced" class="uk-margin-small-left">(required)</em></label>
              <input type="password" class="uk-input" v-model="params.password"/>
            </div>
          </div>

          <template v-if="sendMail">
            <h4 class="uk-margin-medium-top uk-heading-divider">
              Send mail notification
            </h4>
            <div class="uk-margin">
                <input type="text" class="uk-input" placeholder="E-Mail-Recipients" />
            </div>
            <div class="uk-margin">
                <textarea class="uk-textarea" placeholder="Personal note" rows="4"></textarea>
            </div>
            <div class="uk-margin">
              <label><input type="checkbox" class="uk-checkbox uk-margin-small-right"> Send a copy to myself</label>
            </div>
          </template>
        </div>

        <div class="uk-modal-footer uk-text-right">
          <oc-button class="uk-modal-close">Cancel</oc-button>
          <oc-button disabled variation="primary" @click="_addLink"><oc-spinner class="uk-position-small uk-position-center-left" size="small" /><span class="uk-margin-small-left">Save</span></oc-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

export default {
  title: ($gettext) => {
    return $gettext('Links')
  },
  data () {
    return {
      // Render template only when needed
      showTemplate: false,

      // group for easy payload
      params: {
        name: '',
        permissions: 1,
        password: '',
        expireDate: null
      }
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['getToken', 'capabilities']),

    isFolder () {
      return this.highlightedFile.type === 'folder'
    },

    isFile () {
      return !this.isFolder
    },

    expirationDate () {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      return {
        enabled: !!expireDate.enabled,
        days: (expireDate.days) ? expireDate.days : false,
        enforced: expireDate.enforced === '1'
      }
    },

    sendMail () {
      return Object.keys(this.capabilities.files_sharing.public.send_mail).length > 0
    },

    passwordEnforced () {
      const permissions = this.params.permissions
      const password = this.capabilities.files_sharing.public.password.enforced_for

      if (permissions === 1 && password.read_only === '1') { return true }

      if (permissions > 5 && password.read_write === '1') { return true }

      if (permissions === 4 && password.upload_only === '1') { return true }

      return false
    }
  },
  methods: {
    ...mapActions('Files', ['addLink']),
    resetData () {
      this.params = {
        name: this.capabilities.files_sharing.public.defaultPublicLinkShareName,
        permissions: 1,
        password: '',
        expireDate: (this.expirationDate.days) ? moment().add(this.expirationDate.days, 'days').format('DD-MM-YYYY') : null
      }
    },
    _addLink () {
      this.addLink({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        params: this.params
      })
    }
  }
}
</script>
