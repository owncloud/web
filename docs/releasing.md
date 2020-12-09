---
title: "Releasing"
weight: 25
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: releasing.md
---

{{< toc >}}

## Releasing Web

The next generation Web Frontend is shipped as an ocis Extension. The `ocis-web` extension is also embedded in the single binary and part of the `ocis server` command.

This repository contains the assets and these must be released first before being bundled into `ocis-web`.

### Package Hierarchy

- [ocis](https://github.com/owncloud/ocis)
    - [ocis-web](https://github.com/owncloud/ocis-web)
      - [ocis-pkg](https://github.com/owncloud/ocis-pkg)
      - [web](https://github.com/owncloud/web)

#### Releasing Web Frontend

1. Create a branch `release-$version` in <https://github.com/owncloud/web>.
2. Create a folder in `changelog` for the release version and date `mkdir $major.$minor.$patchVersion_YYYY-MM-DD`.
3. Move all changelog items from the `changelog/unreleased/` folder to the `$major.$minor.$patchVersion_YYYY-MM-DD` folder.
4. Commit your changes.
5. After merging, wait for the CI to run on the merge commit.
6. Go to the [Releases section](https://github.com/owncloud/web/releases) and click "Draft a new Release".
7. Use `v$major.$minor.$patch` as a tag (the `v` prefix is important) and publish it.
8. The tag and the Release artifacts will be created automatically.

#### Next steps

The next steps are usually to update the Web assets in the [ocis-web](https://github.com/owncloud/ocis-web) repository.

