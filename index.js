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
  var output, targetFile;
  try {
    targetFile = path.resolve(path.dirname(process.execPath), '..', 'app.ico');
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
      return true;
    }
    if (cmd === '--squirrel-uninstall') {
      run(['--removeShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-obsolete') {
      app.quit();
      return true;
    }
  }
  return false;
};

module.exports = check;
