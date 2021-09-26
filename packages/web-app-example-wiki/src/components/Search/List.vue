<template>
  <div class="files-search-result">
    <div
      v-if="!searchResults.length"
      class="uk-height-1-1 uk-flex uk-flex-column uk-flex-center uk-flex-middle uk-text-center"
    >
      <oc-icon name="folder" type="div" size="xxlarge" />
      <div class="oc-text-muted uk-text-large">
        <p class="oc-text-muted">
          <span v-if="!!$route.query.term">No resource found</span>
          <span v-else>No search term entered</span>
        </p>
      </div>
    </div>
    <div v-for="result in searchResults" v-else :key="result.id" class="search-result-item">
      <router-link :to="{ name: 'wiki-page', params: { id: result.id } }">
        <span>https://en.wikipedia.org/?curid={{ result.id }}</span>
        <h3>{{ result.data.title }}</h3>
      </router-link>
      <p v-html="result.data.snippet"></p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    searchResults: {
      type: Array,
      default: function() {
        return []
      }
    }
  }
}
</script>

<style lang="scss">
.search-result-item {
  margin-bottom: 30px;
  width: 600px;

  a {
    text-decoration: none;

    h3 {
      margin: 0;
      color: rgb(26, 13, 171);
      font-size: 20px;
      line-height: 26px;
    }

    span {
      font-size: 12px;
      color: rgb(77, 81, 86);
    }

    &:hover {
      h3 {
        text-decoration: underline;
      }
    }
  }

  p {
    margin: 0;
    color: rgb(77, 81, 86);
    font-size: 14px;
  }

  .searchmatch {
    font-weight: bold;
  }
}
</style>
