'use strict';

var rwApp = angular.module('rwApp', ['ngMaterial','ngRoute','ngMessages','ngPassword','LocalStorageModule', 'ngSanitize', 'ngAnimate', 'toastr']);

// ALL ROUTE CONFIGURATIONS
rwApp.config(function($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider
  .when('/', { // default routes to home
      templateUrl : 'users/dashboard.html',
      controller: 'dashboardController'
  })
  .when('/user', {
    templateUrl : 'templates/login.html',
    controller: 'authController'
  })
  .when('/user/register', {
    templateUrl : 'templates/register.html',
    controller: 'authController'
  })
  .when('/user/register/verify', {
    templateUrl : 'templates/register-verify.html',
    controller: 'authController'
  })
  .when('/user/revision844', {
    templateUrl : 'templates/loginR844.html',
    controller: 'authController'
  })
  .when('/user/reset', {
    templateUrl : 'templates/reset.html',
    controller: 'authController'
  })
  .when('/user/reset/verify', {
    templateUrl : 'templates/reset-verify.html',
    controller: 'authController'
  })
  .when('/user/revision844/reset', {
    templateUrl : 'templates/resetR844.html',
    controller: 'authController'
  })
  .when('/user/revision844/reset/verify', {
    templateUrl : 'templates/resetR844-verify.html',
    controller: 'authController'
  })
  .when('/user/revision844/update', {
    templateUrl : 'templates/update-R844user.html',
    controller: 'authController'
  })
  .when('/profile', {
    templateUrl : 'users/profile.html',
    controller: 'userController'
  })
  .when('/profile/update', {
    templateUrl : 'users/profile-update.html',
    controller: 'userController'
  })
  .when('/profile/update/phone', {
    templateUrl : 'users/profile-update-phone.html',
    controller: 'userController'
  })
  .when('/profile/update/phone/verify', {
    templateUrl : 'users/profile-update-phone-verify.html',
    controller: 'userController'
  })
  .when('/profile/update/pin', {
    templateUrl : 'users/profile-update-pin.html',
    controller: 'userController'
  })
  .when('/profile/sets', {
    templateUrl : 'users/my-sets.html',
    controller: 'userController'
  })
  .when('/dashboard', {
    templateUrl : 'users/dashboard.html',
    controller: 'dashboardController'
  })
  .when('/content', {
    templateUrl : 'users/content.html',
    controller: 'contentController'
  })
  .when('/set', {
    templateUrl : 'users/set.html',
    controller: 'setController'
  })
});


rwApp.directive("scroll", function ($window) {
  return function(scope, element, attrs) {
    angular.element($window).bind("scroll", function() {

      var lastId,
      topMenu = $(document).find(".navbar"),
      topMenuHeight = topMenu.outerHeight()+15,
      // All list items
      menuItems = topMenu.find("a.anchor"),
      // Anchors corresponding to menu items
      scrollItems = menuItems.map(function(){
        var item = $($(this).attr("href"));
        if (item.length) { return item; }
      });

      // Bind click handler to menu items
      // so we can get a fancy scroll animation
      menuItems.click(function(e){
        var href = $(this).attr("href"),
            offsetTop = href === "#" ? 0 : $(href).offset().top-topMenuHeight+1;
        $('html, body').stop().animate({
            scrollTop: offsetTop
        }, 700);
        e.preventDefault();
      });
      // special logo/home button clicks
      $("#home").click(function(e){
        var href = $(this).attr("href"),
            offsetTop = href === "#" ? 0 : $(href).offset().top-topMenuHeight+1;
        $('html, body').stop().animate({
            scrollTop: offsetTop
        }, 700);
        e.preventDefault();
      });

      // Bind to scroll
      $(window).scroll(function(){
         // Get container scroll position
         var fromTop = $(this).scrollTop()+topMenuHeight;

         // Get id of current scroll item
         var cur = scrollItems.map(function(){
           if ($(this).offset().top < fromTop)
             return this;
         });
         // Get the id of the current element
         cur = cur[cur.length-1];
         var id = cur && cur.length ? cur[0].id : "";

         if (lastId !== id) {
             lastId = id;
             // Set/remove active class
             menuItems
               .parent().removeClass("active")
               .end().filter("[href='#"+id+"']").parent().addClass("active");
         }
      });
      scope.$apply();
    });
  };
});
