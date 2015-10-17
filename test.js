'use strict';

// Run in Electron
var assert = require('assert');

var screenshot = require('./index');
var isPng = require('is-png');
var pngparse = require('pngparse');

describe('Screenshot', function () {
  this.timeout(10000);
  it('should take a screenshot', function (done) {
    screenshot({
      url: 'about:blank',
      width: 500,
      height: 500
    },
    function (err, image) {
      assert.equal(err, undefined);
      assert(isPng(image.data));
      assert.equal(image.size.width, 500 * image.size.devicePixelRatio);
      assert.equal(image.size.height, 500 * image.size.devicePixelRatio);
      done();
    });
  });
  it('should have a `delay` option', function (done) {
    var past = new Date();
    screenshot({
      url: 'about:blank',
      delay: 500,
      width: 500,
      height: 500
    },
    function (err) {
      assert.equal(err, undefined);
      assert((new Date()) - past > 500);
      done();
    });
  });

  it('should have a `page` and `css` option', function (done) {
    screenshot({
      url: 'about:blank',
      page: true,
      width: 500,
      height: 500,
      css: 'html,body{width: 600px; height:600px !important;}'
    },
    function (err, image, cleanup) {
      assert.equal(err, undefined);
      assert.equal(image.size.width, 600 * image.size.devicePixelRatio);
      assert.equal(image.size.height, 600 * image.size.devicePixelRatio);
      cleanup();
      done();
    });
  });

  it('should have a `crop`', function (done) {
    screenshot({
      url: 'about:blank',
      page: true,
      width: 500,
      height: 500,
      crop: {
        x: 10,
        y: 10,
        width: 200,
        height: 200
      }
    },
    function (err, image, cleanup) {
      assert.equal(err, undefined);
      assert.equal(image.size.width, 200 * image.size.devicePixelRatio);
      assert.equal(image.size.height, 200 * image.size.devicePixelRatio);
      cleanup();
      done();
    });
  });

  it('should inject custom css', function (done) {
    screenshot({
      url: 'about:blank',
      width: 600,
      height: 500
    },
   function (err, image, cleanup) {
      assert.equal(err, undefined);
      pngparse.parse(image.data, function (err, pixels) {
        assert.equal(err, undefined);

        // Should be transparent
        assert.equal(pixels.channels, 4);
        assert.equal(pixels.width, 600 * image.size.devicePixelRatio);
        assert.equal(pixels.height, 500 * image.size.devicePixelRatio);

        // Should be red + half transparent
        assert.equal(pixels.data[0], 255);
        assert.equal(pixels.data[1], 255);
        assert.equal(pixels.data[2], 255);
        assert.equal(pixels.data[3], 255);


        cleanup();
        done();
      });
    });
  });
});
