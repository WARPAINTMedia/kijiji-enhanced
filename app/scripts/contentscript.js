'use strict';

// default settings
var settings = {
  enableRotate: {
    type: 'checkbox',
    value: true
  },
  enableMap: {
    type: 'checkbox',
    value: true
  },
  zoomLevel: {
    type: 'number',
    value: 15
  },
  enableLargeThumbnails: {
    type: 'checkbox',
    value: true
  }
};

// some nice helpers
var q = document.querySelector.bind(document);
var qAll = document.querySelectorAll.bind(document);

var each = function(query, fn) {
  Array.prototype.slice.call(qAll(query), 0).forEach(fn);
};

// my main fetching function
function ajax(addr, blob, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', addr, true);
  if (blob) {
    xhr.responseType = 'blob';
  } else {
    // Hack to pass bytes through unprocessed.
    xhr.overrideMimeType('text/plain; charset=utf-8');
  }
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      var res = (blob) ? this.response : JSON.parse(this.response);
      callback(res);
    }
  };
  xhr.send();
}

function addMap(lat, lng, link) {
  var url = 'https://maps.googleapis.com/maps/api/staticmap?center=' + lat + ',' + lng + '&zoom=' + settings.zoomLevel.value + '&size=547x390&markers=color:blue%7C' + lat + ',' + lng + '&maptype=roadmap&sensor=true';
  ajax(url, true, function(res) {
    var image = new Image();
    image.src = window.URL.createObjectURL(res);
    image.style.opacity = 1;
    image.height = '390';
    image.width = '547';
    image.style.maxWidth = '100%';
    // dont do anything until loaded
    image.onload = function() {
      // inject a nice title and a link
      q('#UserContent').innerHTML += '<hr><h1><em>Enhanced</em> Map Preview</h1><br><a href="https://maps.google.com/maps?q=' + link + '" target="_blank" title="Open In Google Maps" id="NewMapLink" style="display: block"></a>';
      // throw the image in that new link
      q('#NewMapLink').appendChild(image);
    };
  });
}

function doRotate() {
  // add some space for the button
  // var area = q('#PageViewImage .centered-item.large-image');
  // if (area) {
  //   area.style.margin = '40px 0';
  // }
  var style = ['position: relative;', 'right: 0;', 'top: 12px;', 'border: solid 1px #EC7D1B;', 'border-radius: 5px;', 'background-clip: padding-box;', 'color: #FFF;', 'background: -webkit-gradient(linear,left top,left bottom,color-stop(12%,#FFB929),color-stop(50%,#F39D00));', 'background: -webkit-linear-gradient(top,#FFB929 12%,#F39D00 50%);', 'background: linear-gradient(top,#ffb929 12%,#f39d00 50%);', 'margin: 0;', 'padding: 3px 4px;', 'outline: none;'].join('');

  var rotateBtn = '<div style=\"text-align:center\"><button type=\"button\" id=\"rotate-image\" style=\"' + style + '\">ROTATE IMAGE</button></div>';

  q('.mfp-image-holder .mfp-figure').innerHTML += rotateBtn;

  // set a data-attribute for the current image
  var item = q('.mfp-figure figure');
  item.setAttribute('data-rotation', 0);

  // now the event listener for the button
  q('#rotate-image').addEventListener('click', function(event) {
    event.preventDefault();
    // get the rotation
    var rotation = parseInt(item.getAttribute('data-rotation'), 10);
    rotation += 90;
    // firgure out the orientation of this thing
    var orientation = {
      '0': 'normal',
      '0.25': 'right',
      '0.5': 'bottom',
      '0.75': 'left'
    }[((rotation / 360) % 1).toString()];
    var image = q('.mfp-img');
    // which side is bigger
    var prop = (image.offsetWidth >= image.offsetHeight) ? 'offsetWidth' : 'offsetHeight';
    // assign the attribute
    item.style.height = image[prop] + 'px';
    item.style.width = image[prop] + 'px';
    // adjust the margin for the different orientation
    if (prop === 'offsetWidth') {
      var amount = ((image.offsetWidth - image.offsetHeight) / 2).toFixed(1);
      if (orientation === 'normal') {
        image.style.margin = '0';
      } else if (orientation === 'bottom') {
        image.style.margin = (amount * 2) + 'px 0 0 0';
      } else {
        image.style.margin = amount + 'px 0 0 0';
      }
    }
    // finally rotate it
    item.style.transform = 'rotate(' + rotation + 'deg)';
    // save the attribute for next click
    item.setAttribute('data-rotation', rotation);
    return false;
  });
  function cleanUp() {
    item.setAttribute('data-rotation', 0);
    item.setAttribute('style', '');
  }
  each('.mfp-arrow', function(elem) {
    elem.addEventListener('click', cleanUp);
  });
}

function getMap() {
  var map = q('#MapLink');
  // does the map exist?
  if (map) {
    // make this url-safe
    var link = encodeURIComponent(map.parentElement.innerText.split('\n')[0]);
    ajax('https://maps.googleapis.com/maps/api/geocode/json?address=' + link + '&sensor=true', false, function(res) {
      if (typeof(res) !== 'undefined') {
        res = res.results[0].geometry.location;
        // fetch a new map with that location and link
        addMap(res.lat, res.lng, link);
      }
    });
  }
}

function sizeThumbnails() {
  // apply these styles to the list thumbnails
  each('.container-results .image img', function(item) {
    item.style.maxWidth = '200px';
    item.style.maxHeight = '200px';
  });
}

function start() {
  if (settings.enableLargeThumbnails.value && q('#PageSRP')) {
    sizeThumbnails();
  }
  // run these functions only when looking at a post
  if (settings.enableRotate.value && q('#MapLightbox')) {
    q('#ShownImage').addEventListener('click', doRotate);
    q('#ImageLightBoxLink').addEventListener('click', doRotate);
  }
  if (settings.enableMap.value && q('#MapLightbox')) {
    getMap();
  }
}

chrome.storage.sync.get(['zoomLevel', 'enableRotate', 'enableLargeThumbnails', 'enableMap'], function(result) {
  settings.zoomLevel = (result.zoomLevel) ? result.zoomLevel: settings.zoomLevel;
  settings.enableRotate = (result.enableRotate) ? result.enableRotate: settings.enableRotate;
  settings.enableLargeThumbnails = (result.enableLargeThumbnails) ? result.enableLargeThumbnails: settings.enableLargeThumbnails;
  settings.enableMap = (result.enableMap) ? result.enableMap: settings.enableMap;
  // there is no DOMReady in extensions, we have a start() though
  start();
});