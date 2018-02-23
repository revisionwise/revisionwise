'use strict';

rwApp.factory('Globals', function() {
  return {
      // rwAPI : 'http://localhost:3000/api/v1'
      rwAPI : 'https://api.revisionwise.com/api/v1'
  };
});

rwApp.factory('Page', function(){
  var title = 'Home - ';
  var bodyClass = '';
  return {
    title: function() { return title; },
    setTitle: function(newTitle) { title = newTitle; },
    bodyClass: function() { return bodyClass; },
    setBodyClass: function(newBodyClass) { bodyClass = newBodyClass; }
  };
});

rwApp.config(function(toastrConfig) {
  angular.extend(toastrConfig, {
    containerId: 'toast-container',
    allowHtml: false,
    newestOnTop: true,
    positionClass: 'toast-top-center',
    maxOpened: 0,
    preventDuplicates: false,
    preventOpenDuplicates: true,
    closeButton: false,
    closeHtml: '<button>&times;</button>',
    extendedTimeOut: 1000,
    target: 'body',
    iconClasses: {
      error: 'toast-error',
      info: 'toast-info',
      success: 'toast-success',
      warning: 'toast-warning'
    },
    messageClass: 'toast-message',
    onHidden: null,
    onShown: null,
    onTap: null,
    progressBar: false,
    tapToDismiss: true,
    templates: {
	  toast: 'directives/toast/toast.html',
	  progressbar: 'directives/progressbar/progressbar.html'
	},
    timeOut: 2000,
    titleClass: 'toast-title',
    toastClass: 'toast'
  });
});
