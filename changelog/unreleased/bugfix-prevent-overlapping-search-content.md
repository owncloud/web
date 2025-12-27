Bugfix: Prevent overlapping search content

We've fixed an issue where the search placeholder and value were overlapping the search scope filter on mobile devices.
The placeholder is now hidden on mobile devices, scope filter is represented by an icon instead of text and a correct padding is applied to the search input so that the value ends before reaching the icons.

https://github.com/owncloud/web/pull/13406
