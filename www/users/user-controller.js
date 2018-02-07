'use strict';

rwApp.controller('userController', function($scope, $rootScope, $http, Globals, Page, $window, $location, localStorageService, $mdToast, $mdDialog, $timeout){
  // Global variables
  $rootScope.reqHome = '';
  $scope.errorMsg = $scope.successMsg = $scope.user_id = "";
  $rootScope.path = $location.path();
  $rootScope.localActiveUser('fetch');

  // --------------------
  // CONTROLLER FUNCTIONS
  // --------------------
  $rootScope.getProfile = function() {
    if(!$rootScope.user_token || $rootScope.user_status === false) {
      $location.path('/user');
    } else {
      if(localStorageService.get('user_id') > 0){
        $rootScope.localActiveUser('fetch');
      } else {
        $scope.loading_profile = true;
        $http({
          method: 'GET',
          url: Globals.rwAPI+'/users/'+$rootScope.user_id+'/profile',
          headers: {'Authorization': $rootScope.user_token}
        }).then(function successCallback(response) {
          $rootScope.localActiveUser('create',response.data.user);
          $scope.loading_profile = false;
        }, function errorCallback(response) {
          $scope.loading_profile = false;
          $scope.responseError = response.data.error;
          if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
            $rootScope.handleUnauthorized();
          }
        });
      }
    }
  };

  $scope.updateProfile = function(user) {
    $scope.submitted = true;
    $scope.updating_info = true;
    if(!$scope.profileForm.$invalid) {
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $scope.submitted = false;
      $http({
        method: 'PUT',
        url: Globals.rwAPI+'/users/update',
        headers: {'Authorization': $rootScope.user_token},
        data: $scope.formData
      }).then(function successCallback(response) {
        $rootScope.localActiveUser('create',response.data.user,response.data.meta);
        $location.path('/profile');
        $rootScope.alertSuccess('Update successful!');
        $scope.updating_info = false;
      }, function errorCallback(response) {
        $scope.updating_info = false;
        $scope.errorMsg = response.data.message;
        $scope.responseError = response.data.error;
        if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
          $rootScope.handleUnauthorized();
        }
      });
    }
    else {
      $scope.updating_info = false;
    }
  };

  $scope.updateUserPhone = function(user) {
    $scope.submitted = true;
    $scope.updating_info = true;
    if(!$scope.updatePhone.$invalid) {
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $scope.submitted = false;
      $http({
        method: 'PUT',
        url: Globals.rwAPI+'/users/'+$rootScope.user_id+'/change-phone',
        headers: {'Authorization': $rootScope.user_token},
        data: $scope.formData
      }).then(function successCallback(response) {
        $scope.updating_info = false;
        $rootScope.alertSuccess('Verification code sent to your new number.');
        $location.path('/profile/update/phone/verify');
      }, function errorCallback(response) {
        $scope.updating_info = false;
        $scope.errorMsg = response.data.message;
        $scope.responseError = response.data.error;
        if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
          $rootScope.handleUnauthorized();
        }
      });
    }
    else {
      $scope.updating_info = false;
    }
  };

  $scope.updatePhoneVerify = function(user) {
    $scope.submitted = true;
    $scope.updating_info = true;
    if(!$scope.verifyPhone.$invalid) {
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $scope.submitted = false;
      $http({
        method: 'POST',
        url: Globals.rwAPI+'/users/register/'+$rootScope.user_id+'/verify',
        headers: {'Authorization': $rootScope.user_token},
        data: $scope.formData
      }).then(function successCallback(response) {
        $rootScope.localActiveUser('create',response.data.user,response.data.meta);
        $scope.updating_info = false;
        $rootScope.alertSuccess('Phone number updated successfully!');
        $location.path('/profile');
      }, function errorCallback(response) {
        $scope.updating_info = false;
        $scope.errorMsg = response.data.error;
        $scope.responseError = response.data.error;
        if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
          $rootScope.handleUnauthorized();
        }
      });
    }
    else {
      $scope.updating_info = false;
    }
  }

    $scope.resendVerificationCode = function() { // Reset pin resend code
        $scope.resending_code = true;
        $http({
            method: 'POST',
            url: Globals.rwAPI+'/users/register/'+$rootScope.user_id+"/resend-verification-code"
        }).then(function successCallback(response) {
            $scope.resending_code = false;
            $rootScope.alertSuccess('Verification code sent to your new number.');
        }, function errorCallback(response) {
            $scope.resending_code = false;
            $scope.errorMsg = response.data.error;
        });
    }

  $scope.updateUserPin = function(user) {
    $scope.submitted = true;
    $scope.updating_info = true;
    if(!$scope.updatePin.$invalid) {
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $scope.submitted = false;
      $http({
        method: 'PUT',
        url: Globals.rwAPI+'/users/'+$rootScope.user_id+'/set-pin',
        headers: {'Authorization': $rootScope.user_token},
        data: $scope.formData
      }).then(function successCallback(response) {
        $scope.updating_info = false;
        $rootScope.alertSuccess('Pin updated successfully!');
        $location.path('/profile');
      }, function errorCallback(response) {
        $scope.updating_info = false;
        $scope.errorMsg = response.data.message;
        $scope.responseError = response.data.error;
        if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
          $rootScope.handleUnauthorized();
        }
      });
    }
    else {
      $scope.updating_info = false;
    }
  };

  $scope.getMySets = function() {
    /*
      - Clears active subject data
      - Loads user sets
    */
    $scope.loading_content = true;
    $rootScope.localActiveSet('destroy');

    $rootScope.activeSubject = '';
    $rootScope.activeSubjectID = 0;
    localStorageService.set('activeSubject', '');
    localStorageService.set('activeSubjectID', 0);

    $http({
      method: 'GET',
      url: Globals.rwAPI+'/user-sets',
      headers: {'Authorization': $rootScope.user_token}
    }).then(function successCallback(response) {
      $scope.sets = response.data;
      if ($scope.sets.length === 0) {
        $rootScope.alertWarning("Oops! You don't have any sets yet.");
        $location.path('/dashboard');
      }
      $scope.loading_content = false;
    }, function errorCallback(response) {
      $scope.loading_content = false;
      $scope.responseError = response.data.error;
      if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
        $rootScope.handleUnauthorized();
      }
    });
  };

  // Check URLs and set section properties

  $rootScope.localActiveUser('fetch');

  if ($rootScope.path === '/profile' && $rootScope.user_token === null) {
    $rootScope.alertWarning('Please login to access that page.');
    $location.path('/user');
  } else if ($rootScope.login_type === 'revision844') {
    $rootScope.alertWarning('Please update your RevisionWise account.');
    $location.path('/user/revision844/update');
    Page.setBodyClass('profile');
  } else {
    if ($rootScope.path === '/profile'){
      $rootScope.getProfile();
      Page.setTitle('User Profile - ');
      Page.setBodyClass('profile');
    }
    else if ($rootScope.path === '/profile/update'){
      Page.setTitle('Profile Update - ');
      Page.setBodyClass('profile-update');
    } else if ($rootScope.path === '/profile/sets'){
      $scope.getMySets();
      Page.setTitle('My Sets - ');
      Page.setBodyClass('my-sets');
    }
  }
});
