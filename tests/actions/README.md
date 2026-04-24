# Actions

This directory contains files (scrips, environment, etc.) for testing the application using GitHub Actions.

## How to use

### Specify oCIS commit

To test the application against a specific oCIS commit, you can specify the commit SHA in the `setup-services.sh` script using the `OCIS_COMMIT` variable. The default value is `latest` which will always use the latest commit from the `master` branch.
