import { mapActions, mapGetters, mapMutations } from 'vuex'
import { buildCollaboratorShare } from '../../helpers/resources'
import { cloneDeep } from 'lodash-es'

export default {
  computed: {
    ...mapGetters(['isOcis'])
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE']),
    ...mapActions('Files', ['setHighlightedFile']),
    async $_mountSideBar_showDetails(resource) {
      // FIXME: to be improved when switching to graph api
      if (resource.isReceivedShare() && !resource.share) {
        // there are some pages where the share information is not pre-loaded. fetch on demand (upon mounting the sidebar)
        const response = await this.$client.shares.getShares(resource.path, {
          shared_with_me: true
        })
        const shares = response.map(element => {
          return buildCollaboratorShare(element.shareInfo, resource, !this.isOcis)
        })
        if (shares?.length === 1) {
          const r = cloneDeep(resource)
          r.share = shares[0]
          this.UPDATE_RESOURCE(r)
        }
      }

      this.setHighlightedFile(resource)
    }
  }
}
