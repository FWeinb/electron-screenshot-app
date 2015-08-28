'use strict';

var BrowserWindow = require('browser-window');
var path = require('path');
var ipc = require('ipc');

module.exports = function (options, callback) {

  if (process.env.NODESCREENSHOT_SHOW === '1') {
    options.show = true;
  }

  var popupWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: options.width,
    height: options.height,
    show: options.show || false,
    frame: false,
    // Used to load the ipc module into __electron__ipc`
    preload: path.join(__dirname, 'preload.js'),
    'node-integration': options.nodeIntegration || false,
    transparent: options.transparent || false,
    'enable-larger-than-screen': true,
    'skip-taskbar': true,
    'overlay-scrollbars': true,
    'direct-write': true
  });

  var cleanup = function () {
    setTimeout(function () {
      setTimeout(function () {
        popupWindow.close();
        popupWindow = null;
      }, 0);
    }, 0);
  };

  var loadTimeout;
  var resetTimeout = function (func) {
    clearTimeout(loadTimeout);
    loadTimeout = setTimeout(func, options.timeout || 2000);
  };

  var makeScreenshot = function () {
    // Remove any loadTimeout
    clearTimeout(loadTimeout);

    var loadEvent = 'Loaded-' + popupWindow.id;
    var sizeEvent = 'Size-' + popupWindow.id;

    // requestAnimationFrame will call the function before the next repaint.
    // This way it is ensured that at least on paint has happend.
    popupWindow.webContents.executeJavaScript(
      'var __electron__ra = window.requestAnimationFrame;' +
      'function __electron__load(){__electron__ipc.send("' + loadEvent + '", { devicePixelRatio: window.devicePixelRatio });};' +
      'function __electron__size(){var w = window,d = document,e = d.documentElement,g = d.body,' +
      'width = Math.max(w.innerWidth, e.clientWidth, g.clientWidth,' + options.width + '),' +
      'height = Math.max(w.innerHeight, e.clientHeight, g.clientHeight,' + options.height + ');' +
      '__electron__ipc.send("' + sizeEvent + '",{width: width, height: height});' +
      '};' +
      'function __electron__loaded(){' +
        '__electron__ra(function(){' +
          // Take screenshot at offset
          'document.body.scrollTop=' + (options.pageOffset || 0) + ';' +
          '__electron__ra(__electron__load);' +
        '});' +
      '}');

    // Register the IPC load event once
    ipc.once(loadEvent, function (e, meta) {
      // Delay the screenshot
      setTimeout(function () {

        var cb = function (data) {
          var obj = {
            data: data.toPng(),
            size: data.getSize()
          };

          obj.size.devicePixelRatio = meta.devicePixelRatio;

          callback(undefined, obj, cleanup);
        };

        if (typeof options.crop === 'object') {
          popupWindow.capturePage(options.crop, cb);
        } else {
          popupWindow.capturePage(cb);
        }

      }, options.delay);
    });

    // Register the IPC sizeEvent once
    ipc.once(sizeEvent, function (e, data) {
      // Don't be smaller than options.width, options.height
      popupWindow.setSize(Math.max(options.width, data.width), Math.max(options.height, data.height));
      popupWindow.webContents.executeJavaScript('window["__electron__loaded"]()');
    });


    if (options.page) {
      popupWindow.webContents.executeJavaScript('window["__electron__size"]()');
    } else {
      popupWindow.webContents.executeJavaScript('window["__electron__loaded"]()');
    }
  };

  popupWindow.webContents.on('did-fail-load', function (e, errorCode, errorDescription) {
    if (errorCode === -3) {
      return; // Ignore user abort
    }
    callback(new Error(errorDescription));
    cleanup();
  });

  popupWindow.webContents.on('crashed', function () {
    callback(new Error('Render process crashed'));
    cleanup();
  });

  if (options.css !== undefined) {
    popupWindow.webContents.on('dom-ready', function () {
      // Inject custom CSS if necessary
      popupWindow.webContents.insertCSS(options.css);
    });
  }

  var asked = false;
  popupWindow.webContents.on('did-stop-loading', function () {
    resetTimeout(makeScreenshot);

    // Shortcut for pages without any iframes
    if (!asked) {
      ipc.once('frame-count', function (e, count) {
        // Call it directly
        if (count === 0) {
          makeScreenshot();
        }
      });
      popupWindow.webContents.executeJavaScript('__electron__ipc.send("frame-count", window.frames.length)');
      asked = true;
    }

  });
  // Start loading the URL
  popupWindow.loadUrl(options.url);
};
