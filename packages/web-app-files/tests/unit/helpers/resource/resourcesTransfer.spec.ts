import { ClipboardActions } from '../../../../src/helpers/clipboardActions'
import { ClientService } from 'web-pkg/src/services'
import {
  ResolveConflict,
  ResourceTransfer,
  TransferType
} from '../../../../src/helpers/resource'
import { mockDeep, mockReset } from 'jest-mock-extended'
import { buildSpace, Resource } from 'web-client/src/helpers'

const clientServiceMock = mockDeep<ClientService>()
let resourcesToMove
let sourceSpace
let targetSpace
let targetFolder

describe('resourcesTransfer', () => {
  beforeEach(() => {
    mockReset(clientServiceMock)
    resourcesToMove = [
      {
        id: 'a',
        name: 'a',
        path: '/a'
      },
      {
        id: 'b',
        name: 'b',
        path: '/b'
      }
    ]
    const spaceOptions = {
      id: 'c42c9504-2c19-44fd-87cc-b4fc20ecbb54'
    }
    sourceSpace = buildSpace(spaceOptions)
    targetSpace = buildSpace(spaceOptions)
    targetFolder = {
      id: 'target',
      path: 'target',
      webDavPath: '/target'
    }
  })
  it.each([
    { name: 'a', extension: '', expectName: 'a (1)' },
    { name: 'a', extension: '', expectName: 'a (2)', existing: [{ name: 'a (1)' }] },
    { name: 'a (1)', extension: '', expectName: 'a (1) (1)' },
    { name: 'b.png', extension: 'png', expectName: 'b (1).png' },
    { name: 'b.png', extension: 'png', expectName: 'b (2).png', existing: [{ name: 'b (1).png' }] }
  ])('should name duplicate file correctly', (dataSet) => {
    const existing = dataSet.existing ? [...resourcesToMove, ...dataSet.existing] : resourcesToMove
    const result = Resource.resolveFileNameDuplicate(dataSet.name, dataSet.extension, existing)
    expect(result).toEqual(dataSet.expectName)
  })
  it.each([
    { action: 'copy', publicFiles: true },
    { action: 'move', publicFiles: true },
    { action: 'copy', publicFiles: false },
    { action: 'move', publicFiles: false }
  ])('should copy and move files if no conflicts exist', async (dataSet) => {
    const client = {
      files: {
        list: () => {
          return []
        },
        copy: jest.fn(),
        move: jest.fn()
      },
      publicFiles: {
        list: () => {
          return []
        },
        copy: jest.fn(),
        move: jest.fn()
      }
    }
    const resourcesTransfer = new ResourceTransfer(
      sourceSpace,
      resourcesToMove,
      targetSpace,
      resourcesToMove[0],
      clientServiceMock,jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn())
    if (dataSet.action === 'copy') {
      await resourcesTransfer.perform(TransferType.COPY)
      if (dataSet.publicFiles) {
        expect(client.publicFiles.copy).toHaveBeenCalledWith('/a', '/target/a', '', false) // eslint-disable-line
        expect(client.publicFiles.copy).toHaveBeenCalledWith('/b', '/target/b', '', false) // eslint-disable-line
      } else {
        expect(client.files.copy).toHaveBeenCalledWith('/a', '/target/a', false) // eslint-disable-line
        expect(client.files.copy).toHaveBeenCalledWith('/b', '/target/b', false) // eslint-disable-line
      }
    }
    if (dataSet.action === 'move') {
      await resourcesTransfer.perform(TransferType.MOVE)
      if (dataSet.publicFiles) {
        expect(client.publicFiles.move).toHaveBeenCalledWith('/a', '/target/a', '', false) // eslint-disable-line
        expect(client.publicFiles.move).toHaveBeenCalledWith('/b', '/target/b', '', false) // eslint-disable-line
      } else {
        expect(client.files.move).toHaveBeenCalledWith('/a', '/target/a', false) // eslint-disable-line
        expect(client.files.move).toHaveBeenCalledWith('/b', '/target/b', false) // eslint-disable-line
      }
    }
  })

  it('should prevent recursive paste', async () => {
    const resourcesTransfer = new ResourceTransfer(
      sourceSpace,
      resourcesToMove,
      targetSpace,
      resourcesToMove[0],
      clientServiceMock,jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn())
    const result = await resourcesTransfer.perform(TransferType.COPY)
    expect(result.length).toBe(0)
  })

  describe('copyMoveResource without conflicts', () => {
    it.each([TransferType.COPY, TransferType.MOVE])(
      'should copy / move files without renaming them if no conflicts exist',
      async (action: TransferType) => {
        clientServiceMock.webdav.listFiles.mockReturnValueOnce(
          new Promise((resolve) => resolve([] as Resource[]))
        )

        const resourcesTransfer = new ResourceTransfer(
          sourceSpace,
          resourcesToMove,
          targetSpace,
          resourcesToMove[0],
          clientServiceMock,jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn())
        const movedResources = await resourcesTransfer.perform(action)

        const fn =
          action === TransferType.COPY
            ? clientServiceMock.webdav.copyFiles
            : clientServiceMock.webdav.moveFiles
        expect(fn).toHaveBeenCalledTimes(resourcesToMove.length)
        expect(movedResources.length).toBe(resourcesToMove.length)

        for (let i = 0; i < resourcesToMove.length; i++) {
          const input = resourcesToMove[i]
          const output = movedResources[i]
          expect(input.name).toBe(output.name)
        }
      }
    )
  })
  it('should show message if conflict exists', async () => {
    const targetFolderItems = [
      {
        id: 'a',
        path: 'target/a',
        webDavPath: '/target/a',
        name: '/target/a'
      }
    ]
    const resourcesTransfer = new ResourcesTransfer(
      resourcesToMove,
      targetFolder,
      null,
      null,
      '',
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn()
    )
    resourcesTransfer.resolveFileExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ strategy: 0 } as ResolveConflict))
    await resourcesTransfer.resolveAllConflicts(resourcesToMove, targetFolder, targetFolderItems)

    expect(resourcesTransfer.resolveFileExists).toHaveBeenCalled()
  })
})
