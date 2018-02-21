<?php

$params  = array_keys($_GET);
if (!isset($params[0])) {
	// happens when requesting non-existing assets
	http_response_code(404);
	die();
}
$app_id  = $params[0];
$app_dir = 'apps';

$js      = array();
$css     = array();

if ( in_array($app_id, scandir($app_dir))) {

	$app_dir      .= "/$app_id";
	$app_info_file = "$app_dir/package.json";

	if ($json = file_get_contents($app_info_file)) {

		$app = json_decode($json);

		foreach ($app->assets as $type => $assets) {
		
			if ($type === "js")
				foreach ($assets as $asset)
					$js[] = "<script src=\"/$app_dir/$asset\" defer></script>";

			if ($type === "css")
				foreach ($assets as $asset)
					$css[] = "<meta href=\"$app_dir/$asset\" media=\"all\" rel=\"stylesheet\">";
		}
	}
}

function render_assets($array) {
	if (is_array($array)) {
		foreach ($array as $asset) {
			echo "\n$asset";
		}
	}
}
