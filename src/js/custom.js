window.onload = function() {
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

  var $clock = $("#countdown");
  var interval = 1000;

  var $d = $("<div class=\"number-of days\" ></div>").appendTo($clock),
    $h = $("<div class=\"number-of hours\" ></div>").appendTo($clock),
    $m = $("<div class=\"number-of minutes\" ></div>").appendTo($clock),
    $s = $("<div class=\"number-of seconds\" ></div>").appendTo($clock);

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
};
