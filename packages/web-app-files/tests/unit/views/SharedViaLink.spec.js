describe('SharedViaLink view', () => {
  describe('when the page has loaded successfully', () => {
    it.todo('should load the resources')
    it.todo('should adjust the table header position')
  })

  describe('when the view is still loading', () => {
    it.todo('should show list-loader component')
  })

  describe('when the view is not loading anymore', () => {
    it.todo('should not show list-loader component')

    describe('when there are no files to be displayed', () => {
      it.todo('should show no-content-message component')
      it.todo('should not show resource-table component')
    })

    describe('when there are one or more files to be displayed', () => {
      it.todo('should not show no-content-message component')
      it.todo('should show resource-table component with props')
      it.todo('should set props on context-actions component')
      it.todo('should set props on list-info component')
      it.todo('should trigger showing the sidebar when a "showDetails" event gets emitted')
      it.todo('should trigger the default action when a "fileClick" event gets emitted')
      it.todo('should lazily load previews when a "rowMounted" event gets emitted')
    })
  })
})
