<?php
/**
 * Plugin Name: Sky Sovereign 3D
 * Description: FPV rugby-drone game. Put the [rugby_game] shortcode on a page to play it.
 * Version: __RUGBY_GAME_VERSION__
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Text Domain: rugby-game-3d
 */

if (!defined('ABSPATH')) {
  exit;
}

define('RUGBY_GAME_VERSION', '__RUGBY_GAME_VERSION__');
define('RUGBY_GAME_FILE', __FILE__);

add_action('wp_enqueue_scripts', 'rugby_game_maybe_enqueue');
add_filter('body_class', 'rugby_game_body_class');
add_filter('template_include', 'rugby_game_template');
add_filter('script_loader_tag', 'rugby_game_module_tag', 10, 3);
add_shortcode('rugby_game', 'rugby_game_shortcode');

function rugby_game_page_has_shortcode() {
  if (!is_singular()) {
    return false;
  }
  $post = get_post();
  if (!$post instanceof WP_Post) {
    return false;
  }
  return has_shortcode($post->post_content, 'rugby_game');
}

function rugby_game_body_class($classes) {
  if (rugby_game_page_has_shortcode()) {
    $classes[] = 'rugby-game-active';
  }
  return $classes;
}

function rugby_game_template($template) {
  if (!rugby_game_page_has_shortcode()) {
    return $template;
  }
  $canvas = plugin_dir_path(RUGBY_GAME_FILE) . 'templates/canvas.php';
  return file_exists($canvas) ? $canvas : $template;
}

function rugby_game_maybe_enqueue() {
  if (!rugby_game_page_has_shortcode()) {
    return;
  }
  rugby_game_enqueue_assets();
}

function rugby_game_shortcode() {
  rugby_game_enqueue_assets();
  if (!rugby_game_manifest_entry()) {
    return '<p>Sky Sovereign is missing its build. Run <code>npm run wordpress</code> and reinstall the zip.</p>';
  }
  return '<div id="root"></div>';
}

function rugby_game_manifest() {
  static $manifest = false;
  if ($manifest !== false) {
    return $manifest;
  }
  $path = plugin_dir_path(RUGBY_GAME_FILE) . 'manifest.json';
  if (!file_exists($path)) {
    $manifest = null;
    return $manifest;
  }
  $decoded = json_decode(file_get_contents($path), true);
  $manifest = is_array($decoded) ? $decoded : null;
  return $manifest;
}

function rugby_game_manifest_entry() {
  $manifest = rugby_game_manifest();
  if (!$manifest) {
    return null;
  }
  foreach ($manifest as $item) {
    if (!empty($item['isEntry'])) {
      return $item;
    }
  }
  return null;
}

function rugby_game_asset_url($file) {
  $file = preg_replace('#^\./#', '', $file);
  return plugin_dir_url(RUGBY_GAME_FILE) . ltrim($file, '/');
}

function rugby_game_enqueue_assets() {
  static $done = false;
  if ($done) {
    return;
  }
  $done = true;

  $entry = rugby_game_manifest_entry();
  if (!$entry || empty($entry['file'])) {
    return;
  }

  wp_enqueue_style(
    'rugby-game-fonts',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap',
    array(),
    null
  );

  $style_deps = array('rugby-game-fonts');
  if (!empty($entry['css']) && is_array($entry['css'])) {
    foreach ($entry['css'] as $index => $css) {
      $handle = 'rugby-game-' . $index;
      wp_enqueue_style($handle, rugby_game_asset_url($css), $style_deps, RUGBY_GAME_VERSION);
      $style_deps = array($handle);
    }
  }

  wp_enqueue_style(
    'rugby-game-embed',
    rugby_game_asset_url('embed.css'),
    $style_deps,
    RUGBY_GAME_VERSION
  );

  // Hashed filename is the cache key. A ?ver= query makes this a different module
  // from the copy the scene chunk imports, so React loads twice and hooks crash.
  wp_register_script(
    'rugby-game',
    rugby_game_asset_url($entry['file']),
    array(),
    null,
    true
  );

  $config = 'window.rugbyGame=' . wp_json_encode(array(
    'assetBase' => plugin_dir_url(RUGBY_GAME_FILE),
  )) . ';';
  wp_add_inline_script('rugby-game', $config, 'before');
  wp_enqueue_script('rugby-game');
}

function rugby_game_module_tag($tag, $handle, $src) {
  if ($handle !== 'rugby-game') {
    return $tag;
  }
  $src = remove_query_arg('ver', $src);
  $module = '<script type="module" src="' . esc_url($src) . '" id="rugby-game-js"></script>' . "\n";
  $replaced = preg_replace('/<script\b[^>]*\bsrc=([\'"]).*?\1[^>]*>\s*<\/script>/i', $module, $tag, 1);
  return is_string($replaced) ? $replaced : $module;
}
