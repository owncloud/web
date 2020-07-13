---
title: "Releasing"
weight: 25
geekdocRepo: https://github.com/owncloud/phoenix
geekdocEditPath: edit/master/docs
geekdocFilePath: releasing.md
---

{{< toc >}}

## Releasing Phoenix

The next generation Web Frontend is shipped as an ocis Extension. The `ocis-phoenix` extension is also embedded in the single binary and part of the `ocis server` command.

This repository contains the assets and these must be released first before being bundled into `ocis-phoenix`.

### Package Hierarchy

- [ocis](https://github.com/owncloud/ocis)
    - [ocis-phoenix](https://github.com/owncloud/ocis-phoenix)
      - [ocis-pkg](https://github.com/owncloud/ocis-pkg)
      - [phoenix](https://github.com/owncloud/phoenix)

#### Releasing Phoenix Frontend

1. Create a branch `release-$version` in <https://github.com/owncloud/phoenix>.
2. Create a folder in `changelog` for the release version and date `mkdir $major.$minor.$patchVersion_YYYY-MM-DD`.
3. Move all changelog items from the `changelog/unreleased/` folder to the `$major.$minor.$patchVersion_YYYY-MM-DD` folder.
4. Commit your changes.
5. After merging, wait for the CI to run on the merge commit.
6. Go to the [Releases section](https://github.com/owncloud/phoenix/releases) and click "Draft a new Release".
7. Use `v$major.$minor.$patch` as a tag (the `v` prefix is important) and publish it.
8. The tag and the Release artifacts will be created automatically.

#### Next steps

The next steps are usually to update the Phoenix assets in the [ocis-phoenix](https://github.com/owncloud/ocis-phoenix) repository.

