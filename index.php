<?php

if (strlen($_SERVER['REQUEST_URI']) < 2) {
	header('Location:?files#/list/home');
	exit;
}

require 'app-loader.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>ownCloud - <?php echo $app->title; ?></title>

	<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<link rel="stylesheet" href="/core/uikit/dist/css/uikit.owncloud.css" />
	<?php render_assets( $css ); ?>
</head>
<body>
	<div id="owncloud">

		<!-- primary menu container -->
		<header>
			<div id="oc-topbar" class="uk-position-top uk-position-fixed uk-position-z-index" uk-navbar="mode: click">
				<div class="uk-navbar-left">
					<ul class="uk-navbar-nav">
						<li>
							<a href="#" uk-toggle="target: #oc-menu">
							<!-- <a href="#"> -->
								<i class="material-icons uk-margin-small-right uk-text-inverse">menu</i>
								<span class="uk-text-inverse">Files</span>
							</a>
                            <!-- CLASSIC MENU STYLE -->
							<!-- <div id="oc-app-menu" uk-dropdown="animation: uk-animation-slide-top-small; pos: bottom-left; offset: 0; delay-hide:100; mode: click">
								<ul uk-grid class="uk-grid-large uk-child-width-1-3">
									<li class="_is_active">
										<img src="/apps/files/icon/app-inverse.svg" alt="Files">
										<span>Files</span>
									</li>
									<li>
										<img src="/apps/activity/icon/app-inverse.svg" alt="Activity">
										<span>Activity</span>
									</li>
									<li>
										<img src="/apps/market/icon/app-inverse.svg" alt="Files">
										<span>Market</span>
									</li>
								</div>
							<div> -->
						</li>
					</ul>
				</div>
				<div class="uk-position-center">
					<div id="oc-logo-main" class="uk-flex uk-flex-middle" onClick="document.location.href='/'">
						<div class="uk-width-1-2 uk-text-right">
							<img src="/core/gfx/cloud-logo-invert.svg" alt="ownCloud" height="45" width="80">
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
		</header>

		<!-- secondary menu container -->
		<aside>
			<div id="oc-menu" uk-offcanvas="mode: reveal">
				<div class="uk-offcanvas-bar uk-background-muted">
					<ul class="uk-nav-default uk-nav-parent-icon" uk-nav="">
						<li class="uk-parent uk-open"><a href="#" uk-height-match=""><i class="material-icons uk-margin-small-right">folder</i>Files</a>
							<ul class="uk-nav-sub">
								<li class="uk-active"><a href="/?files#/list/home">All files</a></li>
								<li><a href="#">Favorites</a></li>
								<li><a href="#">Shared by you</a></li>
								<li><a href="/?files#/sharing/in">Shared with you</a></li>
								<li><a href="#">External storage</a></li>
							</ul>
						</li>
						<li class="uk-nav-divider"></li>
						<li class="uk-parent uk-margin-medium-top"><a href="#" uk-height-match=""><i class="material-icons uk-margin-small-right">account_circle</i>Personal</a>
							<ul class="uk-nav-sub">
								<li><a href="#">About Me</a></li>
								<li><a href="#">Sessions</a></li>
								<li><a href="#">App passwords</a></li>
								<li><a href="#">Sync clients</a></li>
								<li><a href="#">Activity</a></li>
								<li><a href="#">Federated Cloud</a></li>
							</ul>
						</li>
						<li class="uk-nav-divider"></li>
						<li class="uk-parent"><a href="#"><i class="material-icons uk-margin-small-right">help</i>Help</a>
							<ul class="uk-nav-sub">
								<li><a href="#">User documentation</a></li>
								<li><a href="#">Online documentation</a></li>
								<li><a href="#">Forum</a></li>
								<li><a href="#">Issue tracker</a></li>
								<li><a href="#">Commercial support</a></li>
							</ul>
						</li>
						<li class="uk-parent uk-margin-medium-top"><a href="#"><i class="material-icons uk-margin-small-right">settings</i>Administration</a>
							<ul class="uk-nav-sub">
								<li><a href="#">Sharing</a></li>
								<li><a href="#">External storage</a></li>
								<li><a href="#">Federation</a></li>
								<li><a href="#">File handling</a></li>
								<li><a href="#">EMail-templates</a></li>
							</ul>
						</li>
                        <li class="uk-margin-medium-top"><a href="#"><i class="material-icons uk-margin-small-right">exit_to_app</i>Exit ownCloud</a>
					</ul>
				</div>
			</div>
		</aside>


		<!-- app wrapper -->
		<main id="content" class="uk-offcanvas-content">
			<div id="<?php echo $app_id; ?>" data-oc-app-container>
				<!--
					IF THIS DOESN'T GET REPLACED WITH YOUR APP
					YOU'R GONNA HAVE A BAAAD TIME!
				-->
				<p class="uk-position-center">
					Loading …
				</p>
			</div>
		</main>
	</div>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-tagsinput/1.3.6/jquery.tagsinput.min.js"></script>
	<script src="/core/uikit/dist/js/uikit.min.js"></script>
	<?php render_assets( $js ); ?>
</body>
</html>
