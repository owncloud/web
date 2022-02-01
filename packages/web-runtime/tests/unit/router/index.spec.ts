describe('buildUrl', () => {
  it.each`
    location                                                                  | base      | path            | expected
    ${'https://localhost:8080/index.php/apps/web/index.html#/files/list/all'} | ${''}     | ${'/login'}     | ${'https://localhost:8080/index.php/apps/web#/login'}
    ${'https://localhost:8080/index.php/apps/web/index.html#/files/list/all'} | ${''}     | ${'/login/foo'} | ${'https://localhost:8080/index.php/apps/web#/login/foo'}
    ${'https://localhost:8080/index.php/apps/web/#/login'}                    | ${''}     | ${'/bar.html'}  | ${'https://localhost:8080/index.php/apps/web/bar.html'}
    ${'https://localhost:9200/#/files/list/all'}                              | ${''}     | ${'/login/foo'} | ${'https://localhost:9200/#/login/foo'}
    ${'https://localhost:9200/#/files/list/all'}                              | ${''}     | ${'/bar.html'}  | ${'https://localhost:9200/bar.html'}
    ${'https://localhost:9200/files/list/all'}                                | ${'/'}    | ${'/login/foo'} | ${'https://localhost:9200/login/foo'}
    ${'https://localhost:9200/files/list/all'}                                | ${'/foo'} | ${'/bar.html'}  | ${'https://localhost:9200/bar.html'}
    ${'https://localhost:9200/files/list/all'}                                | ${'/foo'} | ${'/bar.htm'}   | ${'https://localhost:9200/bar.htm'}
  `('$path -> $expected', async ({ location, base, path, expected }) => {
    delete window.location
    window.location = new URL(location) as any

    document.querySelectorAll('base').forEach((e) => e.remove())

    if (base) {
      const baseElement = document.createElement('base')
      baseElement.href = base
      document.getElementsByTagName('head')[0].appendChild(baseElement)
    }

    const { buildUrl } = await import('../../../src/router')
    jest.resetModules()

    expect(buildUrl(path)).toBe(expected)
  })
})
