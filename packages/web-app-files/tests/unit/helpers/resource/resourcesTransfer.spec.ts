import { ClientService, LoadingService, LoadingTaskCallbackArguments } from 'web-pkg/src/services'
import { ResourceTransfer, TransferType } from '../../../../src/helpers/resource'
import { ResolveConflict, resolveFileNameDuplicate } from 'web-pkg/src/helpers/resource'
import { mock, mockDeep, mockReset } from 'jest-mock-extended'
import { buildSpace, Resource } from 'web-client/src/helpers'
import { ListFilesResult } from 'web-client/src/webdav/listFiles'
import { Drive } from 'web-client/src/generated'

const clientServiceMock = mockDeep<ClientService>()
const loadingServiceMock = mock<LoadingService>({
  addTask: (callback) => {
    return callback(mock<LoadingTaskCallbackArguments>())
  }
})
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
        path: '/a',
        type: 'folder'
      },
      {
        id: 'b',
        name: 'b',
        path: '/b'
      }
    ]
    const spaceOptions = {
      id: 'c42c9504-2c19-44fd-87cc-b4fc20ecbb54'
    } as unknown as Drive
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
    const result = resolveFileNameDuplicate(dataSet.name, dataSet.extension, existing)
    expect(result).toEqual(dataSet.expectName)
  })

  it('should prevent recursive paste', async () => {
    const resourcesTransfer = new ResourceTransfer(
      sourceSpace,
      resourcesToMove,
      targetSpace,
      resourcesToMove[0],
      clientServiceMock,
      loadingServiceMock,
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn()
    )
    const result = await resourcesTransfer.perform(TransferType.COPY)
    expect(result.length).toBe(0)
  })

  describe('copyMoveResource without conflicts', () => {
    it.each([TransferType.COPY, TransferType.MOVE])(
      'should copy / move files without renaming them if no conflicts exist',
      async (action: TransferType) => {
        const listFilesResult: ListFilesResult = {
          resource: {} as Resource,
          children: []
        }
        clientServiceMock.webdav.listFiles.mockReturnValueOnce(
          new Promise((resolve) => resolve(listFilesResult))
        )
        const resourcesTransfer = new ResourceTransfer(
          sourceSpace,
          resourcesToMove,
          targetSpace,
          targetFolder,
          clientServiceMock,
          loadingServiceMock,
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn()
        )
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
    const resourcesTransfer = new ResourceTransfer(
      sourceSpace,
      resourcesToMove,
      targetSpace,
      resourcesToMove[0],
      clientServiceMock,
      loadingServiceMock,
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
  it('should show error message if trying to overwrite parent', async () => {
    const targetFolderItems = [
      {
        id: 'a',
        path: 'target/a',
        webDavPath: '/target/a',
        name: '/target/a'
      }
    ]
    const resourcesTransfer = new ResourceTransfer(
      sourceSpace,
      resourcesToMove,
      targetSpace,
      resourcesToMove[0],
      clientServiceMock,
      loadingServiceMock,
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn()
    )
    const namingClash = await resourcesTransfer.isOverwritingParentFolder(
      resourcesToMove[0],
      targetFolder,
      targetFolderItems
    )
    const noNamingClash = await resourcesTransfer.isOverwritingParentFolder(
      resourcesToMove[1],
      targetFolder,
      targetFolderItems
    )

    expect(namingClash).toBeTruthy()
    expect(noNamingClash).toBeFalsy()
  })
})
