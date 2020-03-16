---
title: "Releasing Phoenix in oCIS"
weight: 25
geekdocRepo: https://github.com/owncloud/phoenix
geekdocEditPath: edit/master/docs
geekdocFilePath: building.md
---

{{< toc >}}

## Releasing Phoenix

The next generation Web Frontend is shipped as an ocis Extension. The `ocis-phoenix` extension is also embedded in the single binary and part of the `ocis server` command.

To update this package within all the deliveries, we need to update the package in the following chain from the bottom to the top.

### Package Hierarchy

```markdown
- [ ] [ocis](https://githug.com/owncloud/ocis)
    - [ ] [ocis-phoenix](https://github.com/owncloud/ocis-phoenix)
      - [ ] [ocis-pkg](https://github.com/owncloud/ocis-pkg)
      - [ ] [phoenix](https://github.com/owncloud/phoenix)
```

#### Releasing Phoenix Frontend

1. Create a branch `release-$version`. in <https://github.com/owncloud/phoenix>
2. Create a Folder in `changelog` for the release version and date `mkdir $major.$minor.$patchVersion_YYYY-MM-DD`.
3. Move all changelog items from the `changelog/unreleased/` folder to the `$major.$minor.$patchVersion_YYYY-MM-DD` folder.
4. Commit your changes.
5. After merging, wait for the CI to run on the merge commit.
6. Go to "Releases" in GH click "Draft a new Release".
7. Use `v$major.$minor.$patch` as a tag (the `v` prefix is important) and publish it.
8. The tag and the Release artifacts will be created automatically.

#### Updating ocis-phoenix

1. Create a branch `release-$version`. in <https://github.com/owncloud/ocis-phoenix>
2. Create a Folder in `changelog` for the release version and date `mkdir $major.$minor.$patchVersion_YYYY-MM-DD`.
3. Move all changelog items from the `changelog/unreleased/` folder to the `$major.$minor.$patchVersion_YYYY-MM-DD` folder.
4. Update the go module `ocis-pkg` to the latest version <https://blog.golang.org/using-go-modules> .
5. Update the phoenix asset in the Makefile.
6. Run `go generate`.
7. Create Changelog item for the Update in the `$major.$minor.$patchVersion_YYYY-MM-DD` folder.
8. Commit your changes.
9. After merging, wait for the CI to run on the merge commit.
10. Go to "Releases" in GH click "Draft a new Release".
11. Use `v$major.$minor.$patch` as a tag (the `v` prefix is important) and publish it.
12. The tag and the Release artifacts will be created automatically.

#### Updating the embedded ocis root command