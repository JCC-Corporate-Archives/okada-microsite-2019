$("#collapsibleNavbar").on("show.bs.collapse", function () {
  $("#navBar").css({
    "background": "#000"
  });
});

$("#collapsibleNavbar").on("hide.bs.collapse", function () {
  $("#navBar").css({
    "background": "transparent"
  });
});