'use strict';

rwApp.controller('dashboardController', function($scope, $rootScope, $http, Globals, Page, $window, $location, localStorageService, $mdToast, $mdDialog, $timeout){
  // SECTION: Global variables
  var msg, req, content_type_path;
  $rootScope.reqHome = '';
  $scope.activeCategory = $scope.errorMsg = $scope.successMsg = $scope.user_id = "";
  $scope.working = false;
  $rootScope.absoluteURL = $location.absUrl();
  $rootScope.path = $location.path();

  $rootScope.localActiveUser('fetch');

  // SECTION: Main controller functions

  $scope.getCategories = function(){
    /*
    1. Checks whether categoreis are stored locally
    2. If not, loads all categories and stores them locally
    */
    if (localStorageService.get('categories')) {
      $scope.categories = localStorageService.get('categories');
    } else {
      $scope.loading_categories = true;
      $http({
        method: 'GET',
        url: Globals.rwAPI+'/categories',
        headers: {'Authorization': $rootScope.user_token}
      }).then(function successCallback(response) {
        $scope.categories = response.data;
        localStorageService.set('categories',$scope.categories);
        $scope.loading_categories = false;
      }, function errorCallback(response) {
        $scope.loading_categories = false;
        $scope.responseError = response.data.error;
        if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
          $rootScope.handleUnauthorized();
        }
      });
    }
  };

  $scope.getContentTypes = function(id){
    /*
    1. Loads all content types if id = 0,
    otherwise load based on category id
    2. Sets active category
    */
    $scope.contentTypes = '';
    $scope.loading_CTs = true;
    if (id > 0) {
      req = Globals.rwAPI+'/categories/'+id+'/content-types';
      $scope.activeCategory = id;
    } else {
      req = Globals.rwAPI+'/content-types';
      $scope.activeCategory = 0;
    }
    $http({
      method: 'GET',
      url: req,
      headers: {'Authorization': $rootScope.user_token}
    }).then(function successCallback(response) {
      $scope.contentTypes = response.data;
      $timeout(function() { $scope.loading_CTs = false; }, 500);
    }, function errorCallback(response) {
      $scope.loading_CTs = false;
      $scope.responseError = response.data.error;
      if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
        $rootScope.handleUnauthorized();
      }
    });
  };

  $scope.getLevels = function(id,name){
    /*
    1. Stores the selected Content Type's (CT) name and ID locally
    2. Stores user's current step locally as currentStep:
        1 = dashboard
        2 = levels
        3 = subjects
        4 = sets
    3. Creates the clean path as clean_path from CT name
    4. Loads levels based on content-type id supplied
    */

    $scope.loading_content = true;

    $rootScope.activeContentTypeID = id;
    $rootScope.activeContentType = name;
    $rootScope.currentStep = '2';

    localStorageService.set('activeContentTypeID', id);
    localStorageService.set('activeContentType', name);
    localStorageService.set('currentStep', $rootScope.currentStep);

    content_type_path = name.replace(" ","_").toLowerCase();

    $http({
      method: 'GET',
      url: Globals.rwAPI+'/content-types/'+id+'/levels',
      headers: {'Authorization': $rootScope.user_token}
    }).then(function successCallback(response) {
      $rootScope.levels = response.data;
      if ($rootScope.levels.length > 0) {
        $location.path('/content');
      } else {
        msg = 'Sorry, no levels available for '+$rootScope.activeContentType;
        $rootScope.alertWarning(msg);
      }
      $timeout(function() { $scope.loading_content = false; }, 500);
    }, function errorCallback(response) {
      $scope.loading_content = false;
      $scope.responseError = response.data.error;
      if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
        $rootScope.handleUnauthorized();
      }
    });
  };

  // Check URLs and set section properties
  if (!$rootScope.user_token) {
    $location.path('/user');
    $rootScope.alertWarning('Please login to proceed');
  }
  else if ($rootScope.path.indexOf('/dashboard') > -1) {
    $scope.getCategories();
    $scope.getContentTypes(0);
    Page.setTitle('Dashboard - ');
    Page.setBodyClass('dashboard');

    // Clear level-filtering data
    $rootScope.activeContentType = '';
    $rootScope.activeContentTypeID = 0;
    $rootScope.currentStep = '1';
    localStorageService.set('currentStep', $rootScope.currentStep);

    localStorageService.set('activeContentTypeID', '');
    localStorageService.set('activeContentType', 0);

    localStorageService.set('activeLevel', '');
    localStorageService.set('activeLevelID', 0);

    localStorageService.set('activeSubject', '');
    localStorageService.set('activeSubjectID', 0);

    localStorageService.set('activeSet', '');
    localStorageService.set('activeSetID', 0);
  }

});
