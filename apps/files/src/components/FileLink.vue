<template>
  <div id="oc-files-file-link">
    <oc-button variation="primary" icon="add" uk-toggle="target: #oc-files-file-link-modal" @click="resetData(); showTemplate = true" translate>Add Link</oc-button>
    <div id="oc-files-file-link-modal" uk-modal class="uk-flex-top" v-if="showTemplate">
      <div class="uk-modal-dialog uk-margin-auto-vertical">
        <button class="uk-modal-close" type="button"></button>
        <div class="uk-modal-header">
          <h3>Create new link</h3>
          <span>{{ highlightedFile.name }}</span>
        </div>
        <div class="uk-modal-body" uk-overflow-auto>
          <div class="uk-margin">
            <label class="uk-form-label" v-translate>Linkname</label>
            <input class="uk-input" v-model="linkName" />
          </div>
          <h4 class="uk-margin-medium-top uk-heading-divider">
            File permissions
          </h4>
          <div class="uk-margin uk-grid-small" uk-grid>
            <!-- EDITOR -->
            <div class="uk-width-auto">
              <input type="radio" class="uk-radio" v-model="linkPermissions" value="r/w" />
            </div>
            <label class="uk-width-expand" @click="linkPermissions = 'r/w'">
              <span>Editor</span><br>
              <span class="uk-text-meta">Download / View / Edit</span>
            </label>
          </div>
            <!-- EDITOR -->
          <div class="uk-margin uk-grid-small" uk-grid>
            <div class="uk-width-auto">
              <input type="radio" class="uk-radio" v-model="linkPermissions" value="r" />
            </div>
            <label class="uk-width-expand" @click="linkPermissions = 'r'">
              <span>Viewer</span><br>
              <span class="uk-text-meta">Download / View</span>
            </label>
          </div>

          <h4 class="uk-margin-medium-top uk-heading-divider">
            Security settings
          </h4>
          <div class="uk-margin uk-grid-small uk-flex uk-flex-middle" uk-grid>
            <!-- EXPIRATION DATE -->
            <div class="uk-width-1-1 uk-width-2-5@m">
              <label class="uk-form-label" for="">Expiration date</label>
              <input type="date" class="uk-input" />
            </div>
            <div class="uk-width-1-1 uk-width-3-5@m">
              <label class="uk-form-label" for="">Password</label>
              <input type="password" class="uk-input" />
            </div>
          </div>

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
        </div>

        <div class="uk-modal-footer uk-text-right">
          <oc-button class="uk-modal-close">Cancel</oc-button>
          <oc-button variation="primary">Save</oc-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  title: ($gettext) => {
    return $gettext('Links')
  },
  data () {
    return {
      // Render template only when needed
      showTemplate: false,

      linkName: null,
      linkPermissions: null
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['getToken'])
  },
  methods: {
    openModal () {
      // UIkit.modal('#oc-files-file-link-modal').show();
    },
    resetData () {
      this.linkName = 'My Link'
      this.linkPermissions = 'r'
    }
  }
}
</script>
