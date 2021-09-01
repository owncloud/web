describe('statusIndicator', () => {
  describe('getIndicators', () => {
    it.todo(
      'should replace "=" to "" from the resource id if present and set the value as the indicator id'
    )

    describe('user share indicator', () => {
      it.todo('should set "visible" as true if the resource is a user share')
      it.todo('should set "visible" as false if the resource is not a user share')
      it.todo('should set "type" as true if the resource is a direct user share')
      it.todo('should set "type" as false if the resource is not a direct user share')
      it.todo(
        'should set "accessibleDescription" with direct share information if the resource is a direct user share'
      )
      it.todo(
        'should set "accessibleDescription" with parent share information if the resource is not a direct user share'
      )
      it.todo('should set "handler" as "indicatorHandler"')
    })

    describe('link share indicator', () => {
      it.todo('should set "visible" as true if the resource is a link share')
      it.todo('should set "visible" as false if the resource is not a link share')
      it.todo('should set "type" as true if the resource is a direct link share')
      it.todo('should set "type" as false if the resource is not a direct link share')
      it.todo(
        'should set "accessibleDescription" with direct share information if the resource is a direct link share'
      )
      it.todo(
        'should set "accessibleDescription" with parent share information if the resource is not a direct link share'
      )
      it.todo('should set "handler" as "indicatorHandler"')
    })
  })
})
