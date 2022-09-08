$(document).ready(function () {
  $('#apps')
    .find('li[data-id=web]')
    .click(function () {
      $.post(OC.generateUrl('/apps/web/settings/default'), { isDefault: true })
    })
})
