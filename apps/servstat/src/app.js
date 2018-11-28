const pkg = require('../package.json');


const appInfo = {
  name: 'Server Status',
  id: 'servstat',
  isFileEditor: false,
  extensions: []
}
// --- Navigation Item(s) ------------------------------------------------------

const navItems = [{
  name: appInfo.name,
  iconMaterial: 'network_check',
  route: {
    name: appInfo.id
  }
}]


// --- Components --------------------------------------------------------------

import Indicator from './Indicator.vue';

const string = {
  name: 'ServstatStringPlugin',
  template: '<div class="uk-alert-primary" uk-alert><strong>Servstat Plugin:</strong> Telling you that the server URL is {{ server }}</div>',
  computed: {
    server () {
      return this.$root.config.server
    }
  }
}

const ip = {
  name: "ServstatIp",
  template: "<h1>Backend URL: {{ server }}</h1>",
  computed: {
    server() {
      return this.$root.config.server;
    }
  }
};

// --- Routing -----------------------------------------------------------------

const routes = [{
  path: `/${appInfo.id}`,
  component: ip,
  name: appInfo.id
}]

const plugins = [{
  extend: "phoenixNavbarRight",
  component: Indicator
}, {
  extend: "demoBelowTable",
  component: string
}]


export default define({
  appInfo,
  routes,
  plugins,
  navItems
})
