import * as Resource from '../../../../src/helpers/resource'

let resourcesToMove
let targetFolder

describe('copyMove', () => {
  beforeEach(() => {
    resourcesToMove = [
      {
        id: 'a',
        name: 'a',
        webDavPath: '/a'
      },
      {
        id: 'b',
        name: 'b',
        webDavPath: '/b'
      }
    ]
    targetFolder = {
      id: 'target',
      path: 'target',
      webDavPath: '/target'
    }
  })
  it('should copy files if no conflicts exist', async () => {
    const client = {
      files: {
        list: async () => {
          return []
        },
        copy: jest.fn()
      }
    }
    await Resource.copy(
      resourcesToMove,
      targetFolder,
      client,
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn()
    )
    expect(client.files.copy).toHaveBeenCalledWith('/a', '/target/a', false)
    expect(client.files.copy).toHaveBeenCalledWith('/b', '/target/b', false)
  })
  it('should move files if no conflicts exist', async () => {
    const client = {
      files: {
        list: async () => {
          return []
        },
        move: jest.fn()
      }
    }
    await Resource.move(
      resourcesToMove,
      targetFolder,
      client,
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn()
    )
    expect(client.files.move).toHaveBeenCalledWith('/a', '/target/a', false)
    expect(client.files.move).toHaveBeenCalledWith('/b', '/target/b', false)
  })
  it('should not show message if no conflict exists', async () => {
    const client = {
      files: {
        list: async () => {
          return [
            {
              id: 'c',
              path: 'target/c',
              webDavPath: '/target/c',
              name: '/target/c'
            }
          ]
        }
      }
    }
    const resolveFileExistsMethod = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ strategy: 0 } as Resource.ResolveConflict))
    await Resource.resolveAllConflicts(
      resourcesToMove,
      targetFolder,
      client,
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      resolveFileExistsMethod
    )
    expect(resolveFileExistsMethod).not.toHaveBeenCalled()
  })
  it('should show message if conflict exists', async () => {
    const client = {
      files: {
        list: async () => {
          return [
            {
              id: 'a',
              path: 'target/a',
              webDavPath: '/target/a',
              name: '/target/a'
            }
          ]
        }
      }
    }
    const resolveFileExistsMethod = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ strategy: 0 } as Resource.ResolveConflict))
    await Resource.resolveAllConflicts(
      resourcesToMove,
      targetFolder,
      client,
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      resolveFileExistsMethod
    )
    expect(resolveFileExistsMethod).toHaveBeenCalled()
  })
})
