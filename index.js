var path = require('path');
var spawn = require('child_process').spawn;
var debug = require('debug')('electron-squirrel-startup');
var app = require('electron').app;

var run = function(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  debug('Spawning `%s` with args `%s`', updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on('close', done);
};

var check = function(pth,callback) {
  if (process.platform === 'win32') {
    var cmd = process.argv[1];
    debug('processing squirrel command `%s`', cmd);
    var target = pth || path.basename(process.execPath);

    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
      fs.unlink(path.resolve('C:/Users/Public/Desktop/SmarterProctoring.lnk'),(err,res) => {
        run(['--createShortcut=' + target + ''], app.quit);
        return callback(true);
      })
      
    }
    if (cmd === '--squirrel-uninstall') {
      run(['--removeShortcut=' + target + ''], app.quit);
      return callback(true);
    }
    if (cmd === '--squirrel-obsolete') {
      app.quit();
      return callback(true);
    }
  }
  return callback(false);
};

module.exports = check;
