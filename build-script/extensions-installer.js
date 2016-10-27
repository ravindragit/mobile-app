'use strict';

const path = require('path');
const http = require('https');
const npm = require('npm/lib/npm.js');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const unzip = require('unzip');
const shell = require('shelljs');
const getLocalExtensions = require('./getLocalExtensions');
const _ = require('lodash');
const shoutemDependencies = require('../package.json').dependencies;

const dependenciesSet = new Set();

function getDependencyDescriptor(packageName, version) {
  return `${packageName}@${version}`;
}

function addDependenciesToSet(dependencies, set) {
  _.forEach(dependencies, (version, name) => {
    if (name) {
      set.add(getDependencyDescriptor(name, version));
    }
  });
}

function deleteDependenciesFromSet(dependencies, set) {
  _.forEach(dependencies, (version, name) => {
    set.delete(getDependencyDescriptor(name, version));
  });
}

function installLocalExtension(extension) {
  if (!extension) return Promise.resolve();
  const packageName = extension.id;
  const packagePath = extension.path;

  addDependenciesToSet({ [packageName]: `file:${packagePath}` }, dependenciesSet);
  return Promise.resolve(extension);
}

function appendZipExtensionTo(filePath) {
  return `${filePath}.zip`;
}

function downloadZipExtension(extension, destinationFolder) {
  fs.mkdirsSync(destinationFolder);
  const extensionPath = path.join(destinationFolder, extension.id);
  const extensionWriteStream = fs.createWriteStream(appendZipExtensionTo(extensionPath));
  const extensionZipUrl = _.get(extension, 'attributes.location.app.package');
  return new Promise((resolve, reject) => {
    http.get(extensionZipUrl, response => {
      response.pipe(extensionWriteStream);
      extensionWriteStream.on('finish', () => {
        extensionWriteStream.close(() => resolve(extensionPath));
      });
    }).on('error', err => {
      reject(err);
    });
  });
}

function getUnzippedExtension(extension) {
  return new Promise(resolve => {
    downloadZipExtension(extension, './temp')
      .then((extensionPath) => {
        const readStream = fs.createReadStream(appendZipExtensionTo(extensionPath));
        readStream.pipe(
          unzip.Extract({ path: extensionPath }) // eslint-disable-line new-cap
            .on('close', () => {
              readStream.close();
              rimraf(appendZipExtensionTo(extensionPath), () => {});
              const zipExtension = getLocalExtensions([extensionPath])[0];
              resolve(zipExtension);
            })
        );
      });
  });
}

function npmInstall(packageName, productionEnv) {
  console.log(`Installing ${packageName}`);
  return new Promise((resolve, reject) => {
    shell.exec(`yarn add ${packageName}`, (error) => {
      if (error) {
        reject(error);
      } else {
        console.log(`${packageName} installed`);
        resolve();
      }
    });
  });
}

function installNpmExtension(extension) {
  return new Promise((resolve) => {
    // This actually could be any valid npm install argument (version range, GitHub repo,
    // URL to .tgz file or event local path) but for now is always URL to .tgz stored on our server
    const extensionPackageURL = _.get(extension, 'attributes.location.app.package');
    const packageName = extension.id;
    addDependenciesToSet({ [packageName]: extensionPackageURL }, dependenciesSet);
    resolve(extension);
  });
}

function installZipExtension(extension) {
  return getUnzippedExtension(extension)
    .then((zipExtension) => installLocalExtension(zipExtension, 'clearAfterInstall'));
}

function installDependencies(dependenciesArray, productionEnv) {
  return dependenciesArray.length ? npmInstall(dependenciesArray.join(' '), productionEnv) : Promise.resolve();
}

const extensionInstaller = {
  zip: installZipExtension,
  npm: installNpmExtension,
};


/**
 * ExtensionInstaller links all local extensions and installs all other extensions from app
 * configuration. It also builds extension.js file which app uses as depedencies dictionary.
 * @param  Array localExtensions The list of extensions in your local extensions folder
 * @param  Array extensions The list of extensions installed in app
 * @param  String extensionsJsPath path to extension.js file
 */
class ExtensionsInstaller {
  constructor(localExtensions, extensions, extensionsJsPath) {
    this.localExtensions = localExtensions;
    this.extensionsJsPath = extensionsJsPath;
    this.extensionsToInstall = [];

    if (extensions) {
      this.extensionsToInstall = extensions.filter((extension) =>
        _.get(extension, 'attributes.location.app.type') &&
        (!localExtensions.some(localExtension => localExtension.id === extension.id) ||
        localExtensions.length <= 0)
      );
    }
  }

  installExtensions(productionEnv) {
    return new Promise((resolve) => {
      const localExtensionsInstallPromises = this.localExtensions.map((extension) =>
        installLocalExtension(extension)
      );

      const remoteExtensionsInstallPromises = this.extensionsToInstall.map((extension) => {
        const extensionType = _.get(extension, 'attributes.location.app.type');
        return extensionInstaller[extensionType](extension);
      });

      const dependenciesInstallPromise = Promise.all(remoteExtensionsInstallPromises).then(() => {
        deleteDependenciesFromSet(shoutemDependencies, dependenciesSet);
        const dependenciesArray = [...dependenciesSet];
        return installDependencies(dependenciesArray, productionEnv);
      });

      const installPromises = [
        ...localExtensionsInstallPromises,
        ...remoteExtensionsInstallPromises,
        dependenciesInstallPromise,
      ];
      return resolve(Promise.all(installPromises));
    });
  }

  createExtensionsJs(installedExtensions) {
    const extensionsMapping = [];

    installedExtensions.forEach((extension) => {
      if (extension) {
        extensionsMapping.push(`'${extension.id}': require('${extension.id}'),\n  `);
      }
    });

    const extensionsString = extensionsMapping.join('');
    const data = `export default {\n  ${extensionsString}};\n`;

    console.time('create extensions.js');
    return new Promise((resolve, reject) => {
      fs.writeFile(this.extensionsJsPath, data, (error) => {
        if (error) {
          reject(error);
        }

        console.timeEnd('create extensions.js');
        resolve();
      });
    });
  }
}

module.exports = ExtensionsInstaller;
