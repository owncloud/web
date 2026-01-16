Enhancement: Drop custom share filters

In the Shares panel, we have dropped the custom filters applied to the recipients autocomplete.
The filtering is happening already in the backend, so we don't need to apply any custom filters here.
It also makes implementing new filters faster in the future because they need to be implemented only once in the backend.
If this change breaks any specific use cases, it will be fixed in the backend.

https://github.com/owncloud/web/pull/13485
