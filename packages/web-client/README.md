# web-client

The `web-client` is a standalone package that allows you to interact with the [ownCloud Infinite Scale (oCIS)](https://github.com/owncloud/ocis/) APIs via TypeScript. It provides an abstraction layer between the server and a (web-) application that converts API data into objects with helpful types and utilities. This abstraction ensures that users of the APIs don't need in-depth knowledge about them, such as required methods or returned status codes.

The supported APIs are:

- Graph (drives, sharing, user & group management)
- OCS (capabilities & url signing)
- WebDAV (file operations)

## Installation

Depending on your package manager, run one of the following commands:

```
$ npm install @ownclouders/web-client

$ pnpm add @ownclouders/web-client

$ yarn add @ownclouders/web-client
```

## Usage

To utilize the `web-client`, you must instantiate it with a base URI corresponding to your oCIS deployment and an axios instance. The axios instance, or at least its headers, is being used for all requests, requiring the inclusion of all relevant headers such as authorization.

```
import axios from axios
import { client } from '@ownclouders/web-client'

const accessToken = 'some_access_token'
const baseUri = 'some_base_uri'

const axiosClient = axios.create({
	headers: { Authorization: accessToken }
})

const { graph, ocs, webdav } = client({ axiosClient, baseURI })
```

### Graph

The following example demonstrates how to retrieve all spaces accessible to the user. A `SpaceResource` can then be used to e.g. fetch files and folders (see example down below).

```
const mySpaces = await graph.drives.listMyDrives()
```

### OCS

The following examples demonstrate how to fetch capabilities and sign URLs.

```
const capablities = await ocs.getCapabilities()

const signedUrl = await ocs.signUrl('some_url_to_sign', 'your_username')
```

### WebDAV

The following example demonstrates how to list all resources of a given `SpaceResource` (see above how to fetch space resources).

```
const { resource, children } = await webdav.listFiles(spaceResource)
```
