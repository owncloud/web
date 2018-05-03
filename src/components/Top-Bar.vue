<template>
	<div id="oc-head" class="uk-position-top uk-position-fixed uk-position-z-index" uk-navbar="mode: click">
		<div class="uk-navbar-left">
			<ul class="uk-navbar-nav">
				<li>
					<a href="#" uk-toggle="target: #oc-nav">
					<!-- <a href="#"> -->
						<i class="material-icons uk-margin-small-right uk-text-inverse">menu</i>
						<span class="uk-text-inverse">Files</span>
					</a>
				</li>
			</ul>
		</div>
		<div class="uk-position-center">
			<div id="oc-logo-main" class="uk-flex uk-flex-middle" onClick="document.location.href='/'">
				<div class="uk-width-1-2 uk-text-right">
					<img src="core/gfx/cloud-logo-invert.svg" alt="ownCloud" height="45" width="80">
				</div>
				<span class="uk-width-1-2 uk-text-left uk-text-inverse">ownCloud</span>
			</div>
		</div>
		<div class="uk-navbar-right">
			<ul class="uk-navbar-nav">
				<li class="uk-visible@s">
					<a href=""><i class="material-icons uk-text-inverse">search</i></a>
					<input type="text" name="search" value="" class="uk-input uk-width-medium" placeholder="Search…" uk-dropdown="animation: uk-animation-slide-right-small; pos: left-center; offset: 0; delay-hide:100; mode: click;">
				</li>
				<li>
					<a href="#"><i class="material-icons uk-margin-small-right uk-text-inverse">account_circle</i><span class="uk-text-inverse uk-visible@s">Ellen Ripley</span></a>
				</li>
			</ul>
		</div>
	</div>
</template>
