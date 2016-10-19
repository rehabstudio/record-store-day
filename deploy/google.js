var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var debug = require('debug')('deploy');

const yamlFile = path.join(__dirname, 'deployment.yaml');

function bumpVersionNumber() {
  return new Promise(function(resolve, reject) {
    debug('Bumping version number');
    exec('npm version patch --no-git-tag-version', (err, stdout, stderr) => {
      if (err) reject(err);
      resolve();
    });
  });
}

function getYaml() {
  return new Promise(function(resolve, reject) {
    var doc = yaml.safeLoad(fs.readFileSync(yamlFile, 'utf8'));
    resolve(doc);
  });
}

function getImage() {
  return new Promise(function(resolve, reject) {
    getYaml()
      .then(function(yamlObj) {
        var image = yamlObj.spec.template.spec.containers[0].image;
        debug(`image: ${image}`);
        resolve(image);
      });
  });
}

function updateDeploymentYaml() {
  return new Promise(function(resolve, reject) {
    var currentVersion = require('../package').version;
    debug(`Updating deployment.yaml file to version ${currentVersion}`);

    getYaml()
      .then(function(yamlObj) {
        var image = yamlObj.spec.template.spec.containers[0].image;
        var containerPath = image.split(':')[0];
        yamlObj.spec.template.spec.containers[0].image = containerPath + ':v' + currentVersion;
        fs.writeFile(yamlFile, yaml.safeDump(yamlObj), (err) => {
          if (err) reject(err);
          resolve();
        });
      })
      .catch(reject);
  });
}

function buildDockerImage() {
  return new Promise(function(resolve, reject) {
    debug('Building Docker image');
    getImage()
      .then(function(image) {
        var child = exec(`docker build -t ${image} .`, {maxBuffer: 1024 * 1000});
        child.on('close', function() {
          resolve();
        });
        child.stdout.on('data', function(data) {
          debug('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
          reject(data);
        });
      });
  });
}

function pushToContainerRegistry() {
  return new Promise(function(resolve, reject) {
    debug('Pushing image to Google Container Registry');
    getImage()
      .then(function(image) {
        var child = exec(`gcloud docker push ${image}`);
        child.on('close', function() {
          resolve();
        });
        child.stdout.on('data', function(data) {
          debug('stdout: ' + data);
        });
        child.stderr.on('data', function(data) {
          debug('stderr: ' + data);
          reject(data);
        });
      });
  });
}

function deployToKubernetes() {
  return new Promise(function(resolve, reject) {
    debug('Deploying to Kubernetes');
    var child = exec('kubectl apply -f deploy/deployment.yaml');
    child.on('close', function() {
      resolve();
    });
    child.stdout.on('data', function(data) {
      debug('stdout: ' + data);
    });
    child.stderr.on('data', function(data) {
      debug('stderr: ' + data);
      reject(data);
    });
  });
}

try {
  bumpVersionNumber()
    .then(function() {
      return updateDeploymentYaml();
    })
    .then(function() {
      return buildDockerImage();
    })
    .then(function() {
      return pushToContainerRegistry();
    })
    .then(function() {
      return deployToKubernetes();
    })
    .catch(function(err) {
      debug('Resetting files dues to an error');
      debug(err);
      exec('git checkout package.json && git checkout deploy/deployment.yaml', (err, stdout, stderr) => {
        if (err) debug(err);
      });
    });
} catch (e) {
  debug(e);
}
