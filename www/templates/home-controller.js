'use strict';

rwApp.controller('homeController', function($scope, $rootScope, Globals, Page, $window, $mdDialog, $location){

  $scope.status = ' ';
  $scope.customFullscreen = false;

  if ($location.path() === '/') {
    // Sets page title and body class
      Page.setTitle('Better 8-4-4/K.C.P.E. revision - ');
    Page.setBodyClass('home');
  }

  $scope.showEwalletTopup = function(ev) {
    $mdDialog.show({
      controller: $rootScope.DialogController,
      templateUrl: 'templates/dialogs/ewallet-topup.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.,
    })
  };
});
