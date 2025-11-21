Enhancement: Add table caption

We added a caption to the `OcTable` component. It's content can be set via a newly introduced `caption` prop.
The visibility of the caption can also be toggled via new `captionVisible` prop. By default, it is visible only to screen readers.
If the `OcTable` includes any sortable columns, the caption will automatically include screen reader only explanation of sorting capabilities.
This makes sure that screen readers are not overriding column headers with actions via `aria-label` and that it does not repeat the same action multiple times.
All of this behavior is directly inspired by the ARIA Authoring Practices Guide (APG).

https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/
https://github.com/owncloud/web/pull/13224
