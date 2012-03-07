#!/usr/bin/env rake
# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require 'bundler'
require 'ap'

Bundler.require

require 'pathname'
require 'logger'
require 'fileutils'

LOGGER      = Logger.new(STDOUT)

ROOT        = Pathname(File.dirname(__FILE__))
BUILD_DIR   = ROOT.join("assets")
SOURCE_DIR  = ROOT.join("app")
CSS_DIR     = ROOT.join("app", 'stylesheets')
JSON_DIR    = ROOT.join("app", 'json')
SPECS_DIR   = ROOT.join("spec", 'specs')
VENDOR_DIR  = ROOT.join("vendor")

BUNDLES     = [ 'index.html', 'application.css', 'application.js', 'timezones.json', 'zone_offsets.json' ]

task :clean do
  FileUtils.rm_r(BUILD_DIR.children)
  touch(BUILD_DIR.join('.gitkeep'))
end

task :compile => :clean do
  sprockets = Sprockets::Environment.new(ROOT) do |env|
    env.logger = LOGGER
    env.js_compressor = Uglifier.new
    env.css_compressor = YUI::CssCompressor.new
    env.register_engine '.hbs', Rasputin::HandlebarsTemplate
  end
  sprockets.append_path(SOURCE_DIR.to_s)
  sprockets.append_path(CSS_DIR.to_s)
  sprockets.append_path(JSON_DIR.to_s)
  sprockets.append_path(VENDOR_DIR.to_s)
  sprockets.context_class.class_eval do
    def maps
      if ENV['GMAPS_API']
        { 'api_key' => ENV['GMAPS_API'] }
      elsif File.exists?(ROOT.join("config", "gmaps.yml"))
        YAML.load_file(ROOT.join("config", "gmaps.yml"))
      end
    end

    def env
      ENV['RACK_ENV'] || 'development'
    end
  end

  BUNDLES.each do |bundle|
    assets = sprockets.find_asset(bundle)

    assets.write_to(BUILD_DIR.join(bundle).to_s)
  end
end
