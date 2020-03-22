<template>
  <div id="Phoenix" class="uk-height-1-1">
    <div class="oc-login" uk-height-viewport>
      <div class="oc-login-card uk-position-center">
        <h1 v-translate class="oc-login-logo">
          ownCloud
        </h1>
        <div class="oc-login-card-body">
          <h3 class="oc-login-card-title">
            <span v-translate>Missing config</span>
          </h3>
          <p v-translate>
            Please check if file config.json exists.
          </p>
        </div>
        <div class="oc-login-card-footer">
          <p>
            <!-- Until we have documentation for Phoenix let's point this link to Phoenix repo -->
            <translate>For help visit our</translate>
            <translate tag="a" href="https://github.com/owncloud/phoenix" target="_blank"
              >documentation</translate
            >.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MissingConfigPage'
}
</script>
