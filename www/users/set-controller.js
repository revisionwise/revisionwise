'use strict';

rwApp.controller('setController', function($scope, $rootScope, $http, Globals, Page, $window, $location, localStorageService, $mdToast, $mdDialog, $timeout, toastr){
  // SECTION: Global variables
  var body, str, num, count = 0;
  $scope.objChoices = {};
  $scope.choicesCount = 0;
  $scope.questionsCount = 0;
  $scope.correctChoicesCount = 0;

  $scope.activeCategory = $scope.errorMsg = $scope.successMsg = "";
  $rootScope.path = $location.path();

  $scope.chosenAns = '';
  $scope.answeredQueID = '';

  localStorageService.set('activeSetChoices',''); // to avoid persistence while testing
  if (localStorageService.get('activeSetChoices')) {
    $scope.objChoices = localStorageService.get('activeSetChoices');
    $scope.choicesCount = Object.keys($scope.objChoices).length;
  }

  $rootScope.localActiveUser('fetch'); // fetches active_user details
  $rootScope.localActiveSet('fetch'); // fetches active_set details
  $rootScope.activeSubject = localStorageService.get('activeSubject');
  $rootScope.activeSubjectID = localStorageService.get('activeSubjectID');

  $rootScope.currentStep = localStorageService.get('currentStep');

  // SECTION: Main controller functions

  $scope.calculateScore = function(entities) {
    angular.forEach(entities, function(value, key) {
      if(value.format === 'question') {
        var questionID = value.id;
        questionID = '"'+questionID+'"';
        if(questionID in $scope.objChoices && $scope.objChoices[questionID] === value.question_answer){
          $scope.correctChoicesCount++
        }
      }
    });
  };

  $scope.getReportingReasons = function() {
    $http({
      method: 'GET',
      url: Globals.rwAPI+'/reporting-reasons',
      headers: {'Authorization': $rootScope.user_token}
    }).then(function successCallback(response) {
      localStorageService.set('reporting_reasons',response.data);
      $scope.loading_content = false;
    }, function errorCallback(response) {
      $scope.loading_content = false;
      $scope.responseError = response.data.error;
      if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
        $rootScope.handleUnauthorized();
      }
    });
  }

  $scope.getSetQuestions = function(id) {
    /*
      1. Constructs the body info to allow API billing
      2. Requests set questions from API
      3. On success:
        - Prepares localActiveSet variables and other variables
        - Calculates score if set is marked as done
        - Fetches e-wallet balance
        - Pulls reporting options
    */
    $scope.loading_content = true;
    body = { "info": { "allow_billing": true } }; // to allow API billing
    $http({
      method: 'POST',
      url: Globals.rwAPI+'/collections/'+id+'/play',
      data: body,
      headers: {'Authorization': $rootScope.user_token}
    }).then(function successCallback(response) {
      $rootScope.localActiveSet('create',response.data.user_set,response.data.collection);
      $scope.entities = response.data.entities;
      $scope.objChoices = response.data.user_set.chosen;
      $scope.questionsCount = response.data.collection.questions_count;
      $scope.choicesCount = Object.keys($scope.objChoices).length;
      localStorageService.set('activeSetChoices',$scope.objChoices);
      if (response.data.user_set.done === true) {
        $scope.calculateScore(response.data.entities);
      }
      $rootScope.getWalletBalance($rootScope.user_id);
      $scope.getReportingReasons();
      $scope.loading_content = false;
    }, function errorCallback(response) {
      $scope.loading_content = false;
      $scope.responseError = response.data.error;
      if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
        $rootScope.handleUnauthorized();
      }
    });
  };

  $scope.backToSets = function() {
    /*
      1. Destroy all local variables for the curent set
      2. Redirect user to sets listing page
    */
    $rootScope.localActiveSet('destroy');
    if ($rootScope.activeSubjectID === 0) {
      $location.path('/profile/sets');
    } else {
      $location.path('/content');
    }
  }

  $scope.reportQuestion = function(id,ev) {
    /*
      1. Brings up a dialog with options of question reports
    */
    localStorageService.set('reportQuestionID',id);
    $rootScope.showDialog('users/dialogs/report-question.html',ev);
  }

  $scope.saveUserChoice = function(choice, questionID) {
    /*
      Called when user selects a choice
      - Checks whether set is complete/marked/done or not done: if done, don't mark.
      - Collects and formats the choice and question ID ($scope.objChoices)
      - Saves $scope.objChoices on localstorage
      - Updates progress bar
      - Submits user choices ($scope.objChoices) to API
    */

    if ($rootScope.activeSetDone === true) {
      return false;
    } else {
      $scope.saving_progress = true;
      questionID = '"'+questionID+'"';
      $scope.objChoices[questionID] = choice;
      localStorageService.set('activeSetChoices', $scope.objChoices);
      $scope.choicesCount = Object.keys($scope.objChoices).length;
      body = { "user_set": { "chosen": $scope.objChoices, "progress": $scope.choicesCount } };
      $http({
        method: 'POST',
        url: Globals.rwAPI+'/collections/'+$rootScope.activeSetID+'/choose',
        data: body,
        headers: {'Authorization': $rootScope.user_token}
      }).then(function successCallback(response) {
        $scope.saving_progress = false;
      }, function errorCallback(response) {
        $scope.saving_progress = false; // assume progress will be saved on next submission.
        $scope.responseError = response.data.error;
        if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
          $rootScope.handleUnauthorized();
        }
      });
    }
  };

  $scope.userChoices = function(choice, questionID) {
    /*
      1. Checks whether $scope.objChoices is empty
      2. Checks whether key matches questionID
    */
    questionID = '"'+questionID+'"'; // converts questionID to string
    if (Object.keys($scope.objChoices).length && questionID in $scope.objChoices && $scope.objChoices[questionID] === choice) {
      return true;
    }
  };

  $scope.evaluate = function(choice, questionID, question_answer) {
    /*
      - Returns true if question_answer matches selected answer
    */
    if($rootScope.activeSetDone === true) {
      questionID = '"'+questionID+'"'; // converts questionID to string
      if ($scope.objChoices[questionID] !== question_answer && choice == question_answer) {
        return true;
      } else if (questionID in $scope.objChoices && $scope.objChoices[questionID] === choice && $scope.objChoices[questionID] === question_answer) {
        return true;
      } else if (questionID in $scope.objChoices && $scope.objChoices[questionID] === choice && $scope.objChoices[questionID] !== question_answer) {
        return false
      }
    }
  };

  $scope.markSet = function() {
    /*
      1. Checks if all questions have been answered
      2. Compares the right answers vs user answers
      3. Displays comparison
    */
    if ($scope.choicesCount < $scope.questionsCount) {
      num = $scope.questionsCount - $scope.choicesCount;
      if (num === 1) { str = "You missed one question"; }
      else { str = "You missed "+num+" questions"; }
      $rootScope.alertWarning(str);
    } else {
      $scope.is_marking = true;
      $http({
        method: 'POST',
        url: Globals.rwAPI+'/collections/'+$rootScope.activeSetID+'/mark',
        headers: {'Authorization': $rootScope.user_token}
      }).then(function successCallback(response) {
        $scope.getSetQuestions($rootScope.activeSetID);
        $scope.is_marking = false;
      }, function errorCallback(response) {
        $scope.is_marking = false;
        $scope.responseError = response.data.error;
        if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
          $rootScope.handleUnauthorized();
        }
      });
    }
  }

  $scope.restartSet = function(id) {
    /*
      1. Requests API to redo set
      2. Clears local variables holding user choices
      2. Calls getSetQuestions() to load questions
    */
    $scope.loading_content = true;
    body = { "info": { "allow_billing": true } };
    $http({
      method: 'POST',
      data: body,
      url: Globals.rwAPI+'/collections/'+id+'/restart',
      headers: {'Authorization': $rootScope.user_token}
    }).then(function successCallback(response) {
      localStorageService.set('activeSetChoices','');
      localStorageService.set('activeSetDone',false);
      $rootScope.activeSetDone = false;
      $scope.objChoices = {};
      $scope.choicesCount = 0;
      $scope.questionsCount = 0;
      $scope.getSetQuestions(id);
      $scope.loading_content = false;
    }, function errorCallback(response) {
      $scope.loading_content = false;
      $scope.responseError = response.data.error;
      if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
        $rootScope.handleUnauthorized();
      }
    });
  };

  // SECTION: Paths and redirects
  if (!$rootScope.user_token) {
    $rootScope.alertWarning('Please login to proceed');
    $location.path('/user');
  }
  else if ($rootScope.path.indexOf('/set') > -1) {
    if ($rootScope.activeSetID) {
      if ($rootScope.activeSetUserAuthorized === true && ($rootScope.activeSetAction === 'start' || $rootScope.activeSetAction === 'continue' || $rootScope.activeSetAction === 'review')) {
        $scope.getSetQuestions($rootScope.activeSetID);
      } else if ($rootScope.activeSetUserAuthorized === true && $rootScope.activeSetAction === 'restart') {
        $scope.restartSet($rootScope.activeSetID);
      }
      Page.setTitle($rootScope.activeSet+' - ');
      Page.setBodyClass('set');
    } else {
      $location.path('/dashboard');
    }
  }
});
