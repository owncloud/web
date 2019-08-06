<template>
    <div class="oc-files-file-link-form">
      <div class="uk-margin">
        <h4 v-translate>
            Add a new link
        </h4>
        <label class="uk-form-label" v-translate>Name your link</label>
        <input class="uk-input" v-model="params.name" />
        </div>
        <h4 class="uk-margin-medium-top uk-heading-divider">
        <template v-translate v-if="isFile">File permissions</template>
        <template v-translate v-else-if="isFolder">Folder permissions</template>
        <template v-translate v-else>Set permissions</template>
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
            <span class="uk-text-meta">Recipients can view and download contents.</span>
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
            <span class="uk-text-meta">Recipients can view, download and upload contents.</span>
        </label>
        </div>

        <!----------
        | EDITOR |
        ---------->
        <div v-if="isFolder" class="uk-margin uk-grid-small" uk-grid>
        <div class="uk-width-auto">
            <input type="radio" class="uk-radio" v-model="params.permissions" value="15" />
        </div>
        <label class="uk-width-expand" @click="params.permissions = 15">
            <span>Editor</span><br>
            <span class="uk-text-meta">Recipients can view, download, edit, delete and upload contents.</span>
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
            <span class="uk-text-meta">Receive files from multiple recipients without revealing the contents of the folder.</span>
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
                <!-- <input type="text" class="uk-input" placeholder="E-Mail-Recipients" /> -->
                <input type="text" class="uk-input" placeholder="E-Mail-Recipients (API MISSING)" disabled />
            </div>
            <div class="uk-margin">
                <!-- <textarea class="uk-textarea" placeholder="Personal note" rows="4"></textarea> -->
                <textarea class="uk-textarea" placeholder="Personal note (API MISSING)" rows="4" disabled></textarea>
            </div>
            <div class="uk-margin">
                <!-- <label><input type="checkbox" class="uk-checkbox uk-margin-small-right"> Send a copy to myself</label> -->
                <label><input type="checkbox" class="uk-checkbox uk-margin-small-right" disabled> Send a copy to myself</label>
            </div>
        </template>
        <div class="uk-text-right">
            <oc-button @click="cancelLinkCreation">Cancel</oc-button>
            <oc-button v-if="!sharesLoading && isNew" variation="primary" @click="_addLink" v-translate>Create</oc-button>
            <oc-button v-else-if="!sharesLoading && !isNew" variation="primary" @click="_updateLink" v-translate>Save</oc-button>
            <button v-if="sharesLoading" disabled class="uk-button uk-button-default" @click="_addLink"><oc-spinner class="uk-position-small uk-position-center-left" size="small" /><span class="uk-margin-small-left" v-translate>Working</span></button>
        </div>
    </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import mixins from '../mixins'
import moment from 'moment'

export default {
  mixins: [mixins],
  props: ['params', 'linkId'],
  title: ($gettext) => {
    return $gettext('Links')
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'sharesLoading']),
    ...mapGetters(['getToken', 'capabilities']),

    isNew () {
      return !this.linkId
    },

    isFolder () {
      return this.highlightedFile.type === 'folder'
    },

    isFile () {
      return !this.isFolder
    },

    sendMail () {
      return Object.keys(this.capabilities.files_sharing.public.send_mail).length > 0
    },

    expirationDate () {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      return {
        enabled: !!expireDate.enabled,
        days: (expireDate.days) ? expireDate.days : false,
        enforced: expireDate.enforced === '1'
      }
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
    ...mapActions('Files', ['addLink', 'updateLink']),
    _addLink () {
      this.addLink({
        path: this.highlightedFile.path,
        client: this.$client,
        $gettext: this.$gettext,
        params: this.params
      }).then(e => {
        this.closeForm()
      }).catch(e => console.warn(e))
    },
    _updateLink () {
      this.updateLink({
        id: this.linkId,
        client: this.$client,
        $gettext: this.$gettext,
        params: this.params
      }).then(e => {
        this.closeForm()
      }).catch(e => console.warn(e))
    },
    cancelLinkCreation () {
      this.$root.$emit('oc-files-file-link', {
        action: 'cancelLinkCreation'
      })
    },
    closeForm () {
      this.$root.$emit('oc-files-file-link', {
        action: 'closeForm'
      })
    },
    dateLocalised (timestamp) {
      return moment(timestamp).format('DD.MM.YYYY')
    }
  }
}
</script>
