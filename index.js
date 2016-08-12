var path = require('path');
var spawn = require('child_process').spawn;
var debug = require('debug')('electron-squirrel-startup');
var app = require('electron').app;
var fs = require('fs');

var run = function(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  debug('Spawning `%s` with args `%s`', updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on('close', done);
};

var copyIcon = function(sourceFile) {
  var output, targetFile, targetFileName,
    reservedName = "app.ico"; // used by Squirrel uninstall regkey. Will cause conflict if pre-exists.
  try {
    // Build target path
    targetFileName = path.basename(process.execPath, '.exe') + '.ico';
    if(targetFileName.toLowerCase() == reservedName.toLowerCase()) targetFileName = '_' + targetFileName;
    targetFile = path.resolve(path.dirname(process.execPath), '..', targetFileName);
    
    // Perform copy
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
    output = targetFile;
  } catch(err) {
    debug('Failed to copy icon `%s` to `%s` %s', sourceFile, targetFile, err.message);
  }
  return output;
};

var check = function(options) {
  if (process.platform === 'win32') {
    var cmd = process.argv[1], args;
    debug('processing squirrel command `%s`', cmd);
    var target = path.basename(process.execPath);

    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
      args = ['--createShortcut=' + target + ''];
      
      var iconPath = options && options.iconPath && copyIcon(options.iconPath);
      if(iconPath) args.push('--i=' + iconPath);

      run(args, app.quit);
      options && options.onInstall && options.onInstall(cmd === '--squirrel-install');
      return true;
    }
    if (cmd === '--squirrel-uninstall') {
      run(['--removeShortcut=' + target + ''], app.quit);
      options && options.onUninstall && options.onUninstall();
      return true;
    }
    if (cmd === '--squirrel-obsolete') {
      app.quit();
      options && options.onObsolete && options.onObsolete();
      return true;
    }
  }
  return false;
};

module.exports = check;
