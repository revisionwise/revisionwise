$(document).ready(function(){
  var window_height = $(window).height();
  var window_width = $(window).width();
  var footerHeight = 152;
  if (window_width < 599) {
    footerHeight = 520;
  }

  $(this).scrollTop(0);

  var containerMinHeight = window_height - footerHeight;

  resize();
  window.resizeTo('100%','100%');

  if ($(document).find('#main .content.main-content')) {
    $(this).css('min-height',containerMinHeight);
  }

  function resize(){
    window_height = $(window).height();
    window_width = $(window).width();
    footerHeight = 152;
    if (window_width < 599) {
      footerHeight = 520;
    }

    // Adjusts #main height on resize
    containerMinHeight = window_height - footerHeight;
    $(document).find('#main .content.auth, #main .content.loggedin').css('min-height',containerMinHeight);
  }

  $(window).resize(function(){
    window_height = $(window).height();
    window_width = $(window).width();
    footerHeight = 152;
    if (window_width < 599) {
      footerHeight = 520;
    }

    // Adjusts #main height on resize
    containerMinHeight = window_height - footerHeight;
    $(document).find('#main .content.auth, #main .content.loggedin').css('min-height',containerMinHeight);
  });

});
