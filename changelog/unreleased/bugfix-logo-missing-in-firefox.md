Bugfix: Logo not rendering in Firefox

The topbar logo was not visible in Firefox because the SVG files lacked explicit `width` and `height` attributes. Firefox requires these attributes to establish intrinsic dimensions when loading SVGs via `<img>`; without them it renders the image as 0×0. Chrome infers the dimensions from `viewBox` alone.

https://github.com/owncloud/web/pull/13834
