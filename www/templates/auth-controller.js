'use strict';

rwApp.controller('authController', function($scope, $rootScope, $routeParams, $http, Globals, Page, $window, $location, localStorageService, $mdToast, $timeout){
  // SECTION: Global variables
  var msg;
  var url = $location.url();

  $rootScope.absoluteURL = $location.absUrl();
  $rootScope.path = $location.path();

  $scope.errorMsg = $scope.successMsg = $rootScope.user_id = "";
  $scope.working = false;

  $rootScope.localActiveUser('fetch');

  // SECTION: Paths and redirects

  if ($location.path().indexOf('/') > -1) {
    Page.setTitle('');
    Page.setBodyClass('home');
    $rootScope.reqHome = true;
  }
  if ($location.path().indexOf('/user') > -1) {
    Page.setTitle('User - ');
    Page.setBodyClass('user-management');
  }
  if ($rootScope.path === '/user' && $rootScope.user_status === true && $rootScope.user_token !== null) {
    $location.path('/profile');
  }
  if ($rootScope.path === '/user/reset/verify'){
    if ($rootScope.user_id < 1) {
      $rootScope.alertSUccess('Please provide phone number to request verification code');
      $location.path('/user/reset');
    }
  }
  if ($rootScope.path === '/user/register'){
    localStorageService.clearAll();
  }
  if ($rootScope.path === '/user/register/verify' && localStorageService.get('user_token') === "" && localStorageService.get('user_status') === true){
    $location.path('/user');
    $rootScope.errorMsg = "Please login to confirm your account.";
    $rootScope.alertWarning($rootScope.errorMsg);
  }
  if ($rootScope.path === '/user/revision844/reset/verify'){
    $scope.reset_token = $routeParams.token;
  }


  // SECTION: Main functions

  $scope.registerStep1 = function(user) {
    $scope.submitted = true;
    $scope.working = true;
    if(!$scope.regForm01.$invalid) {
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $scope.submitted = false;
      $http({
        method: 'POST',
        url: Globals.rwAPI+'/users/register',
        data: $scope.formData
      }).then(function successCallback(response) {
        $rootScope.localActiveUser('create',response.data.user);
        msg = 'Verification code sent to '+$rootScope.user_phone;
        $rootScope.alertSuccess(msg);
        $location.path('/user/register/verify');
        $scope.working = false;
      }, function errorCallback(response) {
        $scope.working = false;
        if (response.data.errors.mobile) {
          $scope.errorMsg = "Phone number is already taken";
        }
      });
    } else {
      // Show error
      $scope.working = false;
    }
  }

  $scope.registerStep2 = function(user) {
    $scope.submitted = true;
    $scope.working = true;
    if(!$scope.regForm02.$invalid) {
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $scope.submitted = false;
      $http({
        method: 'POST',
        url: Globals.rwAPI+'/users/register/'+$rootScope.user_id+"/verify",
        data: $scope.formData
      }).then(function successCallback(response) {
        $scope.working = false;
        $rootScope.user_status = true;
        localStorageService.set('user_status',true);
        localStorageService.set('login_type','revisionwise');
        $rootScope.localActiveUser('fetch');
        $location.path('/profile');
        $rootScope.alertSuccess('Verification was successful!');
      }, function errorCallback(response) {
        $scope.working = false;
        $scope.errorMsg = response.data.error;
      });
    } else {
      $scope.working = false;
    }
  }

  $scope.resendCode = function() { // Registration resend code
    $scope.resending_code = true;
    $http({
      method: 'POST',
      url: Globals.rwAPI+'/users/register/'+$rootScope.user_id+"/resend-verification-code"
    }).then(function successCallback(response) {
      $scope.resending_code = false;
      msg = 'Verification code sent to '+localStorageService.get('user_phone');
      $rootScope.alertSuccess(msg);
    }, function errorCallback(response) {
      $scope.resending_code = false;
      $scope.errorMsg = response.data.error;
    });
  }

  $scope.resendResetCode = function() { // Reset pin resend code
    $scope.resending_code = true;
    $http({
      method: 'POST',
      url: Globals.rwAPI+'/users/register/'+$rootScope.user_id+"/resend-verification-code"
    }).then(function successCallback(response) {
      $scope.resending_code = false;
      msg = 'Verification code sent to '+localStorageService.get('user_phone');
      $rootScope.alertSuccess(msg);
    }, function errorCallback(response) {
      $scope.resending_code = false;
      $scope.errorMsg = response.data.error;
    });
  }

  $scope.resetRegForm = function() { // Cancel and restart registration
    $scope.regForm02.$setPristine();
    $scope.verification = "";
    $scope.submitted = false;
    $location.path('/user/register');
  }

  $scope.login = function(user) {
    $scope.submitted = true;
    $scope.loggin_in = true;
    if(!$scope.loginForm.$invalid) {
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $scope.submitted = false;
      $http({
        method: 'POST',
        url: Globals.rwAPI+'/users/login',
        data: $scope.formData
      }).then(function successCallback(response) {
        localStorageService.clearAll(); // clear all previous local data
        $rootScope.localActiveUser('create',response.data.user);
        // Redirect user to profile page
        if($rootScope.user_status === true && $rootScope.user_token !== null) {
          /*
            - Checks if user data is available locally
            - Shows profile dialog if information is incomplete
          */
          if (!$rootScope.user_fname || !$rootScope.user_lname || !$rootScope.user_email || !$rootScope.user_yob) {
            $location.path('/profile');
            $rootScope.showDialog('users/dialogs/update-prompt.html');
          } else {
            $location.path('/dashboard');
          }
        } else if($rootScope.user_status === false && $rootScope.user_token !== null) {
          msg  = 'Verification code sent to '+$rootScope.user_phone;
          $rootScope.alertSuccess(msg);
          $location.path('/user/register/verify');
          $scope.successMsg = "Please enter verification code to activate and access your profile.";
        } else if($rootScope.user_token === null) {
          $rootScope.alertWarning('Sorry, session start failed, please try again.');
          $location.path('/user');
        }
        $scope.loggin_in = false;
      }, function errorCallback(response) {
        $scope.loggin_in = false;
        // $scope.errorMsg = response.data.error;
        $scope.errorMsg = "Invalid phone number or pin";
      });
    }
    else {
      $scope.loggin_in = false;
    }
  }

  $scope.resetPinStep1 = function(user) {
    $scope.submitted = true;
    $scope.resetting = true;
    if(!$scope.resetForm01.$invalid) {
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $scope.submitted = false;
      $http({
        method: 'POST',
        url: Globals.rwAPI+'/users/pin-reset-request',
        data: $scope.formData
      }).then(function successCallback(response) {
        $scope.resetting = false;
        localStorageService.set('user_id',response.data.user.id);
        msg = 'Verification code sent to +'+$scope.user.code+'-'+$scope.user.mobile;
        $rootScope.alertSuccess(msg);
        $location.path('/user/reset/verify');
      }, function errorCallback(response) {
        $scope.resetting = false;
        if (response.data.message.indexOf('Uknown user') || response.data.message.indexOf('Unknown user')) {
          $scope.errorMsg = "Phone number not found.";
        }
      });
    } else {
      $scope.resetting = false;
    }
  };

  $scope.resetPinStep2 = function(user) {
    $scope.submitted = true;
    $scope.resetting = true;
    if(!$scope.resetForm02.$invalid) {
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $scope.submitted = false;
      $http({
        method: 'POST',
        url: Globals.rwAPI+'/users/'+$rootScope.user_id+'/reset-pin',
        data: $scope.formData
      }).then(function successCallback(response) {
        $rootScope.localActiveUser('create',response.data.user);
        if ($rootScope.user_status === true) {
          $rootScope.alertSuccess('Pin updated successfully.');
          $location.path('/profile');
        } else if ($rootScope.user_status === false) {
          $rootScope.alertSuccess('Pin updated successfully. Login to activate your account.');
          $location.path('/user');
        }
        $scope.resetting = false;
      }, function errorCallback(response) {
        $scope.resetting = false;
        if (response.data.message.indexOf('Uknown user') || response.data.message.indexOf('Unknown user')) {
          $scope.errorMsg = "Invalid verification code. Please check and try again.";
        }
      });
    } else {
      $scope.resetting = false;
    }
  }

  $scope.resetPinResetForm = function() {
    localStorageService.set('active_resetform','form1');
    $scope.activeResetForm = 'form1';
    $scope.resetForm01.$setPristine();
    $scope.resetForm02.$setPristine();
    $scope.user.phone = "";
    $scope.user.code = "";
    $scope.submitted = false;
  }

  $scope.loginR844 = function(user) {
    $scope.submitted = true;
    $scope.loggin_in = true;
    if(!$scope.loginFormR844.$invalid) {
      $scope.submitted = false;
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $http({
        method: 'POST',
        url: Globals.rwAPI+'/users/revision-844-login',
        data: $scope.formData
      }).then(function successCallback(response) {
        $rootScope.localActiveUser('create',response.data.user);
        $scope.loggin_in = false;
        $rootScope.alertSuccess('Login successful. Update your new RevisionWise account.');
        $location.path('/user/revision844/update');
      }, function errorCallback(response) {
        $scope.loggin_in = false;
        $scope.errorMsg = "Your email or password is invalid.";
      });
    } else {
      $scope.loggin_in = false;
    }
  }

  $scope.resetPasswordR844 = function(user) {
    $scope.submitted = true;
    $scope.resetting = true;
    if(!$scope.resetPwdForm01.$invalid) {
      $scope.submitted = false;
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $http({
        method: 'POST',
        url: Globals.rwAPI+'/users/revision844-password-reset-request',
        data: $scope.formData
      }).then(function successCallback(response) {
        $rootScope.alertSuccess('Password reset instructions have been sent to your email address.');
        $location.path('/user');
        $scope.resetting = false;
      }, function errorCallback(response) {
        $scope.resetting = false;
        $scope.errorMsg = 'Email address not registered.';
      });
    } else {
      $scope.resetting = false;
    }
  }

  $scope.submitNewPassword = function(user) {
    $scope.submitted = true;
    $scope.submitting = true;
    if(!$scope.pwdSubmitFormR844.$invalid) {
      $scope.submitted = false;
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $http({
        method: 'POST',
        url: Globals.rwAPI+'/users/revision844-password-reset',
        data: $scope.formData
      }).then(function successCallback(response) {
        $rootScope.alertSuccess('Password has been updated successfully! Please login.');
        $location.path('/user/revision844');
        $scope.resetting = false;
      }, function errorCallback(response) {
        $scope.resetting = false;
        $rootScope.alertWaring('Sorry, your request is invalid, please place another request.');
        $location.path('/user/revision844/reset');
      });
    } else {
      $scope.submitting = false;
    }
  };

  $rootScope.logout = function(){
    $rootScope.logging_out = true;
    if($rootScope.user_id = localStorageService.get('user_id')) {
      $http({
        method: 'GET',
        headers: {'Authorization': $rootScope.user_token},
        url: Globals.rwAPI+'/users/'+$rootScope.user_id+'/logout'
      }).then(function successCallback(response) {
        $rootScope.localActiveUser('destroy');
        $location.path('/');
        $rootScope.logging_out = false;
      }, function errorCallback(response) {
        $rootScope.logging_out = false;
        $rootScope.localActiveUser('destroy');
        $location.path('/');
      });
    } else {
      $rootScope.logging_out = false;
      $rootScope.localActiveUser('destroy');
      $location.path('/user');
    }
  }

  $scope.r844UpdateStep1 = function(user) {
    $scope.submitted = true;
    $scope.updating_info = true;
    if(!$scope.r844UpdateForm01.$invalid) {
      $scope.formData = angular.toJson({ user: angular.copy(user) });
      $scope.submitted = false;
      $rootScope.user_token = localStorageService.get('user_token');
      $http({
        method: 'PUT',
        url: Globals.rwAPI+'/users/revision844-update',
        headers: {'Authorization': $rootScope.user_token},
        data: $scope.formData
      }).then(function successCallback(response) {
        $scope.updating_info = false;

        msg = 'Verification code sent to '+$rootScope.user_phone;
        $rootScope.alertSuccess(msg);
        $location.path('/user/register/verify');

      }, function errorCallback(response) {
        $scope.updating_info = false;
        // $scope.errorMsg = response.data.message;
        $scope.errorMsg = response.data.error;
      });
    } else {
      $scope.resetting = false;
    }
  };
});
