import { readFileSync } from 'fs'
import { Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { promises as fsPromises } from 'fs'

interface File {
    name: string
    path: string
}

interface FileBuffer {
    name: string
    bufferString: string
}


async function getAllFiles(dirPath: string, baseName: string = ''): Promise<File[]> {
    const results: File[] = []
    const items = await fsPromises.readdir(dirPath)

    // Add the root directory to results
    results.push({
        name: baseName ? `${baseName}/` : '',  // Add '/' to denote directory if baseName is not empty
        path: dirPath
    })
    for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stats = await fsPromises.stat(fullPath)
        if (stats.isDirectory()) {
            // results.push({
            //     name: path.join(baseName, item),
            //     path: fullPath
            // })
            // Recursively process subdirectories
            results.push(...(await getAllFiles(fullPath, path.join(baseName, item))))
        } else if (stats.isFile()) {
            results.push({
                name: path.join(baseName, item),
                path: fullPath
            })
        }
    }
    // console.log(results)
    return results
}

export const dragDropFiles = async (page: Page, resources: File[], targetSelector: string) => {
    const allFiles: File[] = []

    for (const resource of resources) {
        const stats = await fsPromises.stat(resource.path)
        if (stats.isDirectory()) {
            const filesInDir = await getAllFiles(resource.path, resource.name)
            allFiles.push(...filesInDir)
        } else if (stats.isFile()) {
            allFiles.push(resource)
        }
    }
    console.log(allFiles)
    const filesBuffer: FileBuffer[] = await Promise.all(
        allFiles.map(async (file) => {
            if (fs.statSync(file.path).isDirectory()) {
                return {
                    name: file.name,
                    bufferString: null
                }
            } else {
                const buffer = await fsPromises.readFile(file.path)
                return {
                    name: file.name,
                    bufferString: JSON.stringify(Array.from(buffer))
                }
            }
        })
    )

    await page.evaluate<Promise<void>, [FileBuffer[], string]>(
        async ([filesBuffer, targetSelector]) => {
            const dropArea = document.querySelector(targetSelector)
            if (!dropArea) {
                throw new Error(`Drop area with selector ${targetSelector} not found.`)
            }

            const dt = new DataTransfer()

            for (const file of filesBuffer) {
                if (file.bufferString === null) {
                    // Placeholder for handling directory upload
                    const dirBlob = new Blob([])
                    dt.items.add(new File([dirBlob], file.name))
                } else {
                    const buffer = new Uint8Array(JSON.parse(file.bufferString))
                    const blob = new Blob([buffer])
                    const fileObj = new File([blob], file.name)
                    dt.items.add(fileObj)
                }
            }

            dropArea.dispatchEvent(new DragEvent('drop', { dataTransfer: dt }))

            return Promise.resolve()
        },
        [filesBuffer, targetSelector]
    )
}
