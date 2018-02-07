'use strict';

rwApp.controller('userDialogController', function($scope, $rootScope, $http, Globals, Page, $window, $location, localStorageService, $mdToast, $mdDialog, $timeout){

  $scope.inputError = $rootScope.submitted = false; // refresh with every pop-up load
  $scope.errorMsg = $scope.successMsg = "";
  $scope.is_matching = true;
  $scope.sent_form = false;

  $rootScope.localActiveUser('fetch');
  $rootScope.localActiveSet('fetch');
  $scope.currency = $rootScope.activeSetCurrency;
  $scope.price = $rootScope.activeSetPrice;

  $scope.reporting_reasons = localStorageService.get('reporting_reasons');
  $scope.set_id = localStorageService.get('reportQuestionID');

  $scope.proceedToPremiumSet = function() {
    $location.path('/set');
    localStorageService.set('activeSetUserAuthorized',true);
  };

  $scope.submitReport = function(data) {
    /*
      - Checks if form is valid
      - Submits data and sets sent_form to true to display success message
    */

    $scope.submitted = true;
    if(data.reporting_reason_id) {
      $scope.submitting_report = true;
      $scope.formData = angular.toJson({ entity: angular.copy(data) });
      $http({
        method: 'POST',
        data: $scope.formData,
        url: Globals.rwAPI+'/reported-questions',
        headers: {'Authorization': $rootScope.user_token}
      }).then(function successCallback(response) {

        $scope.submitting_report = false;
        $scope.sent_form = true;
        // $timeout(function() { $mdDialog.cancel(); }, 1500);
      }, function errorCallback(response) {
        this.submitting_report = false;
        $scope.responseError = response.data.error;
        if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
          $rootScope.handleUnauthorized();
        }
      });
    }
  };

  $scope.referFriend = function(data) {
    /*
      - Checks if form is valid
      - Also checks if phone numbers are matching
      - Submits data and sets sent_form to true to display success message
    */
    $scope.submitting_form = $scope.is_matching = $scope.submitted = true;
    if(!$scope.referFriendForm.$invalid) {
      $scope.formData = angular.copy(data);
      if ((data.code === data.confirm_code) && (data.mobile === data.confirm_mobile)) {
        $scope.formData = angular.toJson({ invitation: angular.copy(data) });
        $http({
          method: 'POST',
          data: $scope.formData,
          url: Globals.rwAPI+'/invitations',
          headers: {'Authorization': $rootScope.user_token}
        }).then(function successCallback(response) {
          $scope.submitting_form = false;
          $scope.sent_form = true;
          $scope.errorMsg = response.message;
        }, function errorCallback(response) {
          $scope.submitting_form = false;
          $scope.errorMsg = response.data.message;
          $scope.responseError = response.data.error;
          if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
            $rootScope.handleUnauthorized();
          }
        });
      } else {
        $scope.is_matching = $scope.submitting_form = false;
      }
    } else {
      $scope.submitting_form = false;
    }
  }

});
