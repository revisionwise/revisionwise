'use strict';

rwApp.controller('mainController', function($scope, $rootScope, $http, Globals, Page, $window, $mdDialog, $timeout, $mdSidenav, $log, localStorageService, $location, $mdToast, toastr){

  // Declare global variables
  $scope.Page = Page;
  $rootScope.absoluteURL = $location.absUrl();
  $rootScope.path = $location.path();
  $(document).find('body').scrollTop(0);

  $rootScope.demo_user_id = 1;
  $rootScope.demo_user_mobile = 123456789;
  $rootScope.demo_user_code = 254;
  $rootScope.demo_user_pin = "1234";

  $rootScope.demo_account = false;

  // GLOBAL FUNCTIONS
  $rootScope.localActiveUser = function(action, user, meta) {
    // Fetches, creates or destroys active_user local variables
    if (action === 'fetch') {
      $rootScope.user_id = localStorageService.get('user_id');
      $rootScope.user_fname = localStorageService.get('user_fname');
      $rootScope.user_lname = localStorageService.get('user_lname');
      $rootScope.user_token = localStorageService.get('user_token');
      $rootScope.user_points = localStorageService.get('user_points');
      $rootScope.user_phone = localStorageService.get('user_phone');
      $rootScope.user_status = localStorageService.get('user_status');
      $rootScope.user_email = localStorageService.get('user_email');
      $rootScope.user_yob = localStorageService.get('user_yob');
      $rootScope.user_wallet = localStorageService.get('user_wallet');
      $rootScope.user_currency = localStorageService.get('user_currency');
    } else if (action === 'create') {
      $rootScope.user_token = user.auth_token;
      $rootScope.user_id = user.id;
      $rootScope.user_fname = user.first_name;
      $rootScope.user_lname = user.last_name;
      $rootScope.user_points = user.points_balance;
      $rootScope.user_wallet = user.wallet_balance;
      $rootScope.user_currency = user.currency;
      $rootScope.user_phone = user.mobile;
      $rootScope.user_status = user.status;
      $rootScope.user_email = user.email;
      $rootScope.user_yob = user.year_of_birth;
      $rootScope.user_token = user.token;
      localStorageService.set('user_token',user.auth_token);
      localStorageService.set('user_id',user.id);
      localStorageService.set('user_fname',user.first_name);
      localStorageService.set('user_lname',user.last_name);
      localStorageService.set('user_points',user.points_balance);
      localStorageService.set('user_wallet',user.wallet_balance);
      localStorageService.set('user_currency',user.currency);
      localStorageService.set('user_phone',user.mobile);
      localStorageService.set('user_status',user.status);
      localStorageService.set('user_email',user.email);
      localStorageService.set('user_yob',user.year_of_birth);
    } else if (action === 'destroy') {
      // Basically logout
      localStorageService.clearAll();
      $rootScope.user_id = $rootScope.user_fname = $rootScope.user_lname = $rootScope.user_email =
      $rootScope.user_token = $rootScope.user_points = $rootScope.user_wallet = $rootScope.user_status =
      $rootScope.user_currency = $rootScope.user_yob = $rootScope.user_phone = $rootScope.login_type = "";
    }

    if($rootScope.user_id == $rootScope.demo_user_id){  // demo user
        $rootScope.demo_account = true;
    } else {
        $rootScope.demo_account = false;
    }

  };



  $rootScope.localActiveSet = function(action, user_set, collection) {
    // Fetches or destroys active_set local variables
    if (action === 'fetch') {
      $rootScope.activeSet = localStorageService.get('activeSet');
      $rootScope.activeSetID = localStorageService.get('activeSetID');
      $rootScope.activeSetCurrency = localStorageService.get('activeSetCurrency');
      $rootScope.activeSetPrice = localStorageService.get('activeSetPrice');
      $rootScope.activeSetUserAuthorized = localStorageService.get('activeSetUserAuthorized');
      $rootScope.activeSetIsExpired = localStorageService.get('activeSetIsExpired');
      $rootScope.activeSetAction = localStorageService.get('activeSetAction');
    } else if (action === 'create') {
      $rootScope.activeSet = collection.name;
      $rootScope.activeSetID = collection.id;
      $rootScope.activeSetCurrency = collection.currency;
      $rootScope.activeSetPrice = collection.price;
      $rootScope.activeSetIsExpired = user_set.is_expired;
      $rootScope.activeSetDone = user_set.done;
      localStorageService.set('activeSet',collection.name);
      localStorageService.set('activeSetID',collection.id);
      localStorageService.set('activeSetCurrency',collection.currency);
      localStorageService.set('activeSetPrice',collection.price);
      localStorageService.set('activeSetIsExpired',user_set.is_expired);
      localStorageService.set('activeSetDone',user_set.done);
    } else if (action === 'destroy') {
      localStorageService.set('activeSet','');
      localStorageService.set('activeSetID',0);
      localStorageService.set('activeSetCurrency','');
      localStorageService.set('activeSetPrice','');
      localStorageService.set('activeSetUserAuthorized','');
      localStorageService.set('activeSetIsExpired','');
      localStorageService.set('activeSetAction','');
      localStorageService.set('activeSetDone','');
      $rootScope.activeSet = $rootScope.activeSetCurrency = $rootScope.activeSetIsExpired = '';
      $rootScope.activeSetDone = $rootScope.activeSetUserAuthorized = $rootScope.activeSetPrice = '';
      $rootScope.activeSetID = 0;
    }
  };

  $rootScope.verifySetAccess = function (set_id, set_name, set_currency, set_price, set_is_expired, set_action, ev) {
    /*
      1. When price === 0 allow user to do-set
      2. When price > 0 and set access isn't expired, allow user to do-set
      2. When price > 0 and set access is expired, check if wallet balance >= price
      3. If user wallet has sufficient balance inform user about the cost, with yes/no options.
         - Call play function if user agrees, then close dialog
         - Close dialog if user declines/cancels
      4. If user wallet has insufficient balance prompt user to top up
    */
    localStorageService.set('activeSetID',set_id);
    localStorageService.set('activeSet',set_name);
    localStorageService.set('activeSetCurrency',set_currency);
    localStorageService.set('activeSetPrice',set_price);
    localStorageService.set('activeSetIsExpired',set_is_expired);
    localStorageService.set('activeSetAction',set_action);

    if (set_price === 0 || (set_price > 0 && set_is_expired === false)) {
      localStorageService.set('activeSetUserAuthorized',true);
      $rootScope.localActiveSet('fetch'); // grab a few of the available values
      $location.path('/set');
    } else if (set_price > 0){
      if ($rootScope.user_wallet >= set_price) {
        $rootScope.showDialog('users/dialogs/premium-sets-alert.html',ev);
      } else if ($rootScope.user_wallet < set_price) {
        $rootScope.showDialog('users/dialogs/low-balance-alert.html',ev);
      }
    }
  };

  $rootScope.getWalletBalance = function() {
    /*
      - Gets e-wallet balance and points of current user
      - Updates scope and localstorage variables
    */
    $scope.updating_numbers = true;
    $http({
      method: 'GET',
      url: Globals.rwAPI+'/users/'+$rootScope.user_id+'/balance',
      headers: {'Authorization': $rootScope.user_token}
    }).then(function successCallback(response) {
      localStorageService.set('user_wallet',response.data.user.wallet_balance);
      localStorageService.set('user_points',response.data.user.points);
      $rootScope.localActiveUser('fetch');
      $scope.updating_numbers = false;
    }, function errorCallback(response) {
      $scope.updating_numbers = false;
      $scope.responseError = response.data.error;
      if ($scope.responseError = response.data.error && $scope.responseError.indexOf('Unauthorized') > -1 ) {
        $rootScope.handleUnauthorized();
      }
    });
  };

  $rootScope.alertSuccess = function(msg,title){
    toastr.success (msg,title);
  };

  $rootScope.alertWarning = function(msg,title){
    toastr.warning (msg,title);
  };

  $rootScope.showDialog = function(url,ev) {
    /*
      Shows a dialog (modal) window
    */
    $mdDialog.show({
      controller: $rootScope.DialogController,
      templateUrl: url,
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.,
    });
  }

  $rootScope.DialogController = function($scope, $mdDialog) {

    $rootScope.user_fname = localStorageService.get('user_fname');
    $rootScope.user_wallet = localStorageService.get('user_wallet');

    $rootScope.localActiveSet('build');

    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function(action) {
      $mdDialog.cancel('');
      if (action === 'clear_active_set') {
        $rootScope.localActiveSet('destroy');
      }
    };

    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }

  $rootScope.handleUnauthorized = function(){
    $rootScope.logout();
    $location.path('/user');
    $rootScope.alertWarning('Please login to continue.');
  }

  // -------------------------------------
  // CONTROLS FOR MOBILE MENU
  // -------------------------------------
  $scope.toggleMobileMenu = buildToggler('mobileMenu');
  $scope.isOpenMobileMenu = function(){
    return $mdSidenav('mobileMenu').isOpen();
  };
  /**
  * Supplies a function that will continue to operate until the time is up.
  */
  function debounce(func, wait, context) {
    var timer;

    return function debounced() {
      var context = $scope,
      args = Array.prototype.slice.call(arguments);
      $timeout.cancel(timer);
      timer = $timeout(function() {
        timer = undefined;
        func.apply(context, args);
      }, wait || 10);
    };
  }
  /**
  * Build handler to open/close a SideNav; when animation finishes report completion in console
  */
  function buildDelayedToggler(navID) {
    return debounce(function() {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav(navID)
      .toggle()
      .then(function () {
        $log.debug("toggle " + navID + " is done");
      });
    }, 200);
  }
  function buildToggler(navID) {
    return function() {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav(navID)
      .toggle()
      .then(function () {
        $log.debug("toggle " + navID + " is done");
      });
    };
  }
  $scope.close = function () {
    // Component lookup should always be available since we are not using `ng-if`
    if($scope.isOpenMobileMenu) {
      $mdSidenav('mobileMenu').close();
    }
  };

});
