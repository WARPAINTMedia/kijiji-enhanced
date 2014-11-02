'use strict';

// some nice helpers
var q = document.querySelector.bind(document);
var qAll = document.querySelectorAll.bind(document);

var each = function(query, fn) {
  Array.prototype.slice.call(qAll(query), 0).forEach(fn);
};

// add some space for the button
q('#PageViewImage .centered-item.large-image').style.margin = '40px 0';

var style = [
  'position: relative;',
  'right: 0;',
  'top: 12px;',
  'border: solid 1px #EC7D1B;',
  'border-radius: 5px;',
  'background-clip: padding-box;',
  'color: #FFF;',
  'background: -webkit-gradient(linear,left top,left bottom,color-stop(12%,#FFB929),color-stop(50%,#F39D00));',
  'background: -webkit-linear-gradient(top,#FFB929 12%,#F39D00 50%);',
  'background: linear-gradient(top,#ffb929 12%,#f39d00 50%);',
  'margin: 0;',
  'padding: 3px 4px;',
  'outline: none;'
].join('');

var rotateBtn = '<button type=\"button\" id=\"rotate-image\" style=\"' + style + '\">ROTATE IMAGE</button>';

q('#MainContainer .img-scroll').innerHTML += rotateBtn;

// set a data-attribute for all the items
each('.photo-navigation li.showing a', function(item) {
  item.setAttribute('data-rotation', 0);
});

// now the event listener for the button
q('#rotate-image').addEventListener('click', function(event) {
  event.preventDefault();
  var item = q('.photo-navigation li.showing a');
  item.style.display = 'block';
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
  var image = item.querySelector('img');
  // which side is bigger
  var prop = (image.offsetWidth >= image.offsetHeight) ? 'offsetWidth': 'offsetHeight';
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