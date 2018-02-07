'use strict';

rwApp.controller('contentController', function($scope, $rootScope, $http, Globals, Page, $window, $location, localStorageService, $mdToast, $mdDialog, $timeout){
  // SECTION: Global variables
  var msg, req, content_type_path;
  $scope.userSetAction = '';
  $(this).scrollTop(0);

  $rootScope.localActiveUser('fetch');

  $scope.activeCategory = $scope.errorMsg = $scope.successMsg = "";

  $rootScope.absoluteURL = $location.absUrl();
  $rootScope.path = $location.path();

  // SECTION: Retrieve localstorage data

  $rootScope.activeContentType = localStorageService.get('activeContentType');
  $rootScope.activeContentTypeID = localStorageService.get('activeContentTypeID');

  $rootScope.activeLevel = localStorageService.get('activeLevel');
  $rootScope.activeLevelID = localStorageService.get('activeLevelID');

  $rootScope.activeSubject = localStorageService.get('activeSubject');
  $rootScope.activeSubjectID = localStorageService.get('activeSubjectID');

  $rootScope.currentStep = localStorageService.get('currentStep');

  // SECTION: Main controller functions

  $scope.getLevels = function(id,name) {
    /*
      1. Stores the selected Content Type's (CT) name and ID locally
      2. Stores user's current step locally as currentStep:
          1 = dashboard
          2 = levels
          3 = subjects
          4 = sets
      3. Creates the clean path as clean_path from CT name
      4. Loads levels (if levels array is empty) based on content-type id supplied
    */
    if (id < 1) {
      $location.path('/dashboard');
    } else {
      $rootScope.levels = '';
      $scope.loading_content = true;

      $rootScope.activeLevel = '';
      $rootScope.activeLevelID = 0;
      localStorageService.set('activeLevel', '');
      localStorageService.set('activeLevelID', 0);

      $rootScope.activeContentTypeID = id;
      $rootScope.activeContentType = name;
      $rootScope.currentStep = '2';

      localStorageService.set('activeContentTypeID', id);
      localStorageService.set('activeContentType', name);
      localStorageService.set('currentStep', $rootScope.currentStep);

      $http({
        method: 'GET',
        url: Globals.rwAPI+'/content-types/'+id+'/levels',
        headers: {'Authorization': $rootScope.user_token}
      }).then(function successCallback(response) {
        $rootScope.levels = response.data;
        $(this).scrollTop(0);
        if ($rootScope.levels.length > 0 && $rootScope.path !== '/content') {
          $location.path('/content');
        } else if ($rootScope.levels.length === 0 ) {
          msg = 'Sorry, no levels available for '+$rootScope.activeContentType;
          $rootScope.alertWarning(msg);
        }
        $scope.loading_content = false;
      }, function errorCallback(response) {
        $scope.loading_content = false;
        $scope.responseError = response.data.error;
        if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
          $rootScope.handleUnauthorized();
        }
      });
    }
  };

  $scope.getSubjects = function(id,name) {
    /*
      1. Stores the selected Level's name and ID locally
      2. Stores user's current step locally as currentStep:
          1 = dashboard
          2 = levels
          3 = subjects
          4 = sets
      3. Creates the clean path as clean_path from CT name
      4. Loads subjects (if subjects array is empty) based on level id supplied
    */

    $scope.loading_content = true;
    $scope.subjects = [];

    $rootScope.activeLevelID = id;
    $rootScope.activeLevel = name;
    $rootScope.currentStep = '3';

    localStorageService.set('activeLevelID', id);
    localStorageService.set('activeLevel', name);
    localStorageService.set('currentStep', $rootScope.currentStep);

    $http({
      method: 'GET',
      url: Globals.rwAPI+'/levels/'+id+'/subjects',
      headers: {'Authorization': $rootScope.user_token}
    }).then(function successCallback(response) {
      $scope.subjects = response.data;
      $scope.loading_content = false;
    }, function errorCallback(response) {
      $scope.loading_content = false;
      $scope.responseError = response.data.error;
      if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
        $rootScope.handleUnauthorized();
      }
    });
  };

  $scope.getSets = function(id,name) {
    /*
      1. Clears active set information stored locally
      2. Stores the selected Subject's name and ID locally
      3. Stores user's current step locally as currentStep = 4
      4. Creates the clean path as clean_path from CT name *
      5. Loads sets based on subject id supplied
    */

    $scope.loading_content = true;
    $rootScope.activeSubjectID = id;
    $rootScope.activeSubject = name;
    $rootScope.currentStep = '4';
    localStorageService.set('activeSubjectID', id);
    localStorageService.set('activeSubject', name);
    localStorageService.set('currentStep', $rootScope.currentStep);
    $rootScope.localActiveSet('destroy');

    $http({
      method: 'GET',
      url: Globals.rwAPI+'/subjects/'+id+'/collections',
      headers: {'Authorization': $rootScope.user_token}
    }).then(function successCallback(response) {
      $scope.sets = response.data;
      $scope.loading_content = false;
    }, function errorCallback(response) {
      $scope.loading_content = false;
      $scope.responseError = response.data.error;
      if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
        $rootScope.handleUnauthorized();
      }
    });
  };

  $scope.backToLevels = function() {
    /*
      1. Clears current active level name and id
      2. Loads levels based on active content type name and ID
    */
    $rootScope.levels = '';
    $scope.loading_content = true;

    $rootScope.activeContentType = localStorageService.get('activeContentType');
    $rootScope.activeContentTypeID = localStorageService.get('activeContentTypeID');

    // Slide animation to previous screen

    $scope.getLevels($rootScope.activeContentTypeID, $rootScope.activeContentType);
  }

  $scope.backToSubjects = function() {
    /*
      1. Clears current active subject name and id
      2. Loads subjects based on active level name and ID
    */

    $rootScope.activeSubject = '';
    $rootScope.activeSubjectID = 0;
    localStorageService.set('activeSubject', '');
    localStorageService.set('activeSubjectID', 0);

    $rootScope.activeLevel = localStorageService.get('activeLevel');
    $rootScope.activeLevelID = localStorageService.get('activeLevelID');

    // Slide animation to previous screen

    $scope.getSubjects($rootScope.activeLevelID, $rootScope.activeLevel);
  }


  // SECTION: Paths and redirects

  if ($rootScope.path.indexOf('/content') > -1 && $rootScope.user_token) {
    Page.setTitle('Content - ');
    Page.setBodyClass('content');
    if ($rootScope.currentStep === '1' || !$rootScope.currentStep) {
      $location.path('/dashboard');
    }
    if ($rootScope.currentStep === '2') {
      if ($rootScope.activeContentTypeID) {
        $scope.getLevels($rootScope.activeContentTypeID, $rootScope.activeContentType);
      } else {
        $rootScope.currentStep = '1';
        localStorageService.set('currentStep',$rootScope.currentStep);
        $location.path('/content');
      }
    }
    if ($rootScope.currentStep === '3') {
      if ($rootScope.activeLevelID) {
        $scope.getSubjects($rootScope.activeLevelID, $rootScope.activeLevel);
      } else {
        $rootScope.currentStep = '2';
        localStorageService.set('currentStep',$rootScope.currentStep);
        $location.path('/content');
      }
    }
    if ($rootScope.currentStep === '4') {
      if ($rootScope.activeSubjectID) {
        $scope.getSets($rootScope.activeSubjectID, $rootScope.activeSubject);
      } else {
        $rootScope.currentStep = '3';
        localStorageService.set('currentStep',$rootScope.currentStep);
        $location.path('/content');
      }
    }
  } else {
    $rootScope.alertWarning('Please login to proceed');
    $location.path('/user');
  }

});
