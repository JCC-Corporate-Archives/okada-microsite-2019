window.onload = function() {

  // NAVBAR
  $(".navbar-nav>li>a").on("click", function() {
    $(".navbar-collapse").collapse("hide");
  });

  // Add scrollspy to <body>
  $("body").scrollspy({ target: ".navbar", offset: 70 });

  $("#collapsibleNavbar").on("show.bs.collapse", function() {
    $("#navBar").css({
      background: "#000"
    });
  });

  $("#collapsibleNavbar").on("hide.bs.collapse", function() {
    $("#navBar").css({
      background: "transparent"
    });
  });

  // NAVBAR OVERLAY
  $("#openNav").on("click", function() {
    $("body").css("overflow", "hidden");
    $("#myNav").css("height", "100%");
    setTimeout(function() {
      $("#myNav").addClass("collapsed");
    }, 100);
  });
  $("#closeNav").on("click", function() {
    $("body").css("overflow", "");
    $("#myNav")
      .css("height", "0%")
      .removeClass("collapsed");
  });

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
};
