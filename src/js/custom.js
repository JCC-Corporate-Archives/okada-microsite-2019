$(document).ready(function() {

  // NAVBAR OVERLAY
  $("#openNav").on("click", function() {
    $("#myNav").css("height", "100%");
    setTimeout(function() {
      $("#myNav")
        .addClass("collapsed")
        .find(".overlay-content")
        .fadeIn();
      $("body").css("overflow", "hidden");
    }, 250);
  });
  $("#closeNav").on("click", function() {
    $("#myNav")
      .css("height", "0%")
      .removeClass("collapsed")
      .find(".overlay-content")
      .hide(); // this causes to display: none
    setTimeout(function() {
      $("body").css("overflow", "");
    }, 100);
  });
  $("a.nav-modal-link[href*=\"#\"]")
    .on("click", function() {
      $("body").css("overflow", "");

      $("#myNav")
        .css("height", "0%")
        .removeClass("collapsed")
        .find(".overlay-content")
        .hide(); // this causes to display: none
    })
    .smoothscroll({ duration: 400, easing: "swing" });

  // Scroll to Top
  $(window).scroll(function() {

    // If page is scrolled more than 75px
    if ($(this).scrollTop() >= 75) {
      $("#return-to-top").fadeIn(200); // Fade in the arrow
    } else {
      $("#return-to-top").fadeOut(200); // Else fade out the arrow
    }

    // simply unset to avoid bugs for mobile
    $("#myNav").css("display", "flex");
  });
  $("#return-to-top")
    .on("click", function() {

      // simply unset to avoid bugs for mobile
      $("#myNav").css("display", "flex");
    })
    .smoothscroll({ duration: 500, easing: "swing" });

  var $clock = $("#countdown");
  var interval = 1000;

  var $d = $($clock).find(".number-of.days"),
    $h = $($clock).find(".number-of.hours"),
    $m = $($clock).find(".number-of.minutes"),
    $s = $($clock).find(".number-of.seconds");

  /**
   * Timer by setting interval
   */
  setInterval(function() {

    // new Date().getTime();
    var now = moment().local();

    // new Date(now + 60 * 1000);
    var then = moment("01-01-2020 00:00:00", "DD-MM-YYYY HH:mm:ss");

    // using Countdown JS
    var countDownObj = countdown(
      now,
      then,
      countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS
    );
    var d = countDownObj.days,
      h = countDownObj.hours,
      m = countDownObj.minutes,
      s = countDownObj.seconds;

    d = $.trim(d).length === 1 ? "0" + d : d;
    h = $.trim(h).length === 1 ? "0" + h : h;
    m = $.trim(m).length === 1 ? "0" + m : m;
    s = $.trim(s).length === 1 ? "0" + s : s;

    // show how many days, hours, minutes and seconds are left
    $d.text(d).append("<div class=\"days-label\">DAYS</div>");
    $h.text(h).append("<div class=\"days-label\">HOURS</div>");
    $m.text(m).append("<div class=\"days-label\">MINUTES</div>");
    $s.text(s).append("<div class=\"days-label\">SECONDS</div>");
  }, interval);

  // init WOW.js
  // Anti Flickering
  new WOW({ offset: 0 }).init();

  // The Restaurant slider
  new Swiper("#theRestaurantsSlider", {
    loop: 1,
    spaceBetween: 0,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false
    },
    pagination: {
      el: ".swiper-pagination"
    }
  });
});

// window.onload = function() {
// };
