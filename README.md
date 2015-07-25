# electron-screenshot-app [![Build Status](https://travis-ci.org/FWeinb/electron-screenshot-app.svg?branch=master)](https://travis-ci.org/FWeinb/electron-screenshot-app)

> Make screenshots


## Install

```sh
$ npm install electron-screenshot-app --save 
```


## Usage

```js
var app = require('app');
var screenshot = require('electron-screenshot-app');

  app.on('ready', function(){
    screenshot({
      url: 'http://sassdoc.com',
      width: 1920,
      height: 1080
    },
    function(err, image){
      // image.data is a Node Buffer
      // image.size contains width and height
      // image.devicePixelRatio will contain window.devicePixelRatio
    })
  });
```


## API

### screenshot(options, callback(err, img))

Takes a screenshots with `options`. The callback is called with an img object like

```js
{
  data: <Buffer >
  size: {
    width: X
    height: N
  }
}
```

The screenshot is always saved as an png file.

#### options

#### url
*Required*
Type: `String`

##### delay

Type: `number` *(milliseconds)*  
Default: `0`

Useful when the site does things after load that you want to capture.

##### width

Type: `number`
Default: `0`

Specify the with of the browser window

##### height

Type: `number`
Default: `0`

Specify the height of the browser window

##### crop

Type: `Object`  
Default: `undefined`

A crop object may look like this:
```js
{
  x : 10,
  y : 10,
  width : 100,
  height : 100
}
```

##### css

Type: `String`  
Default: `undefined`

This css will be injected into the page before the screenshot is taken.

##### transparent

Type: `Boolean`  
Default: `false`

This will enable transparency. Keep in mind that most site do set a background color on the html/body tag.
You can overwrite this by using the `css` option using something like `html,body{ background-color: transparent !important;}`.

##### page

Type: `Boolean`  
Default: `false`

This will try to capture the whole page. `width` and `height` are considered the minimum size.

