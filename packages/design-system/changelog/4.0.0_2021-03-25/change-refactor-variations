Change: Refactor variations & color palette

We have updated the ownCloud Design System colors, removing duplicates, 
introducing CI colors and explicitly adding colors that formerly were calculated or came from uikit.

We have also unified the usage of "variations" that are used to give visual clues about different usages of the same components.
Icons, buttons, modals and notifications (and perhaps others) can now have the variations `passive, primary, success, danger, warning`.

While doing that, we also replaced the SASS variables in `src/` with custom CSS properties which are overwrite-able at runtime, 
so theming the ODS is possible now (at least from a colors perspective, font sizes and spacing will eventually follow).

https://github.com/owncloud/owncloud-design-system/pull/1140
https://github.com/owncloud/owncloud-design-system/pull/1169
