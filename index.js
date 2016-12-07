var path = require('path'),
  child_process = require('child_process'),
  debug = require('debug')('electron-squirrel-startup'),
  electron = require('electron'),
  fs = require('fs');

var debug_local = debug('electron-squirrel-startup'),
  spawn = child_process.spawn,
  app = electron.app,
  run = function(args, done) {
    var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
    debug('Spawning `%s` with args `%s`', updateExe, args);
    spawn(updateExe, args, {
      detached: true
    }).on('close', done);
  };

var copyIcon = function(sourceFile) {
  // used by Squirrel uninstall regkey. Will cause conflict if pre-exists.
  var output, targetFile, targetFileName,
    reservedName = 'app.ico';
  try {
    // Build target path
    targetFileName = path.basename(process.execPath, '.exe') + '.ico';
    if (targetFileName.toLowerCase() === reservedName.toLowerCase()) {
      targetFileName = '_' + targetFileName;
    }
    targetFile = path.resolve(path.dirname(process.execPath), '..', targetFileName);
    
    // Perform copy
    fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
    output = targetFile;
  } catch (err) {
    debug('Failed to copy icon `%s` to `%s` %s', sourceFile, targetFile, err.message);
  }
  return output;
};

var check = function(options) {
  if (process.platform === 'win32') {
    var cmd = process.argv[1], args,
      target = path.basename(process.execPath);
    debug('processing squirrel command `%s`', cmd);

    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
      args = ['--createShortcut=' + target + ''];
      
      var iconPath = options && options.iconPath && copyIcon(options.iconPath);
      if (iconPath) {
        args.push('--i=' + iconPath);
      }

      options && options.onInstall && options.onInstall(cmd === '--squirrel-install');
      run(args, app.quit);
      return true;
    }
    if (cmd === '--squirrel-uninstall') {
      options && options.onUninstall && options.onUninstall();
      run(['--removeShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-obsolete') {
      options && options.onObsolete && options.onObsolete();
      app.quit();
      return true;
    }
  }
  return false;
};

module.exports = check;
