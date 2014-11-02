'use strict';

window.Zepto(function($) {
  $('.menu a').click(function(ev) {
    ev.preventDefault();
    var selected = 'selected';

    $('.mainview > *').removeClass(selected);
    $('.menu li').removeClass(selected);
    setTimeout(function() {
      $('.mainview > *:not(.selected)').css('display', 'none');
    }, 100);

    $(ev.currentTarget).parent().addClass(selected);
    var currentView = $($(ev.currentTarget).attr('href'));
    currentView.css('display', 'block');
    setTimeout(function() {
      currentView.addClass(selected);
    }, 0);

    setTimeout(function() {
      $('body')[0].scrollTop = 0;
    }, 200);
  });

  $('#launch_modal').click(function(ev) {
    ev.preventDefault();
    var modal = $('.overlay').clone();
    modal = $(modal);
    modal.removeAttr('style');
    modal.find('button, .close-button').click(function() {
      modal.addClass('transparent');
      setTimeout(function() {
        modal.remove();
      }, 1000);
    });

    modal.click(function() {
      modal.find('.page').addClass('pulse');
      modal.find('.page').on('webkitAnimationEnd', function() {
        $(this).removeClass('pulse');
      });
    });
    modal.find('.page').click(function(ev) {
      ev.stopPropagation();
    });
    $('body').append(modal);
  });

  $('.mainview > *:not(.selected)').css('display', 'none');
  // Saves options to chrome.storage
  function save(e) {
    var item = {};
    var value = e.target.value;
    if (e.target.type === 'checkbox' || e.target.type === 'radio') {
      value = e.target.checked;
    }
    item[e.target.id] = {
      value: value,
      type: e.target.type
    };
    chrome.storage.sync.set(item, function() {
      // Update status to let user know options were saved.
      var status = $('#status');
      status.text('Options saved.');
      setTimeout(function() {
        status.text('');
      }, 750);
    });
  }

  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
      enableRotate: true,
      radioToggle: '1',
      textInput: '',
      dropdown: ''
    }, function(items) {
      console.log(items);
      for(var value in items) {
        if (items[value].type === 'checkbox') {
          $('#' + value).prop('checked', items[value].value);
        } else {
          $('#' + value).val(items[value].value);
        }
      }
    });
  }
  $('input[type=checkbox], input[type=radio]').on('click', save);
  $('input[type=text], input[type=number], input[type=search], select').on('input', save);
  $(document).ready(restore);
});