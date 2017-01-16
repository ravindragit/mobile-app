#!/usr/bin/env node

const _ = require('lodash');
const AppBuild = require('./app-build');
// eslint-disable-next-line import/no-unresolved
const commandLineArgs = require('command-line-args');
const path = require('path');
const fs = require('fs-extra');

const DEFAULT_CONFIG = 'config.json';

const cli = commandLineArgs([
  { name: 'configPath', type: String },
  { name: 'appId', type: Number },
  { name: 'serverApiEndpoint', type: String },
  { name: 'production', type: Boolean },
  { name: 'offlineMode', type: Boolean },
  { name: 'configurationFilePath', type: String },
  { name: 'workingDirectories', type: String, multiple: true },
  { name: 'extensionsJsPath', type: String },
  { name: 'platform', type: String },
  { name: 'authorization', type: String },
  { name: 'excludePackages', type: String, multiple: true },
  { name: 'baseAppId', type: String },
  { name: 'cacheBaseApp', type: String },
  { name: 'cacheFolder', type: String },
  { name: 'platformsFolder', type: String },
  { name: 'buildFolder', type: String },
  { name: 'skipNativeDependencies', type: String },
]);

const cliArgs = cli.parse();
const configPath = cliArgs.configPath || path.resolve(DEFAULT_CONFIG);
const config = require(configPath);
// merge command line arguments and config.json
const buildConfig = _.merge(config, cliArgs);
fs.writeJsonSync(DEFAULT_CONFIG, buildConfig);
const build = new AppBuild(buildConfig);
build.run();
