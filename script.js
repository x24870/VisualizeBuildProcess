function add_content(content){
  $(".content").append(content);
}

$(".show-content-btn").click(function(){
  $(".content").hide();
});

function add_card(){
  $.get("card.html", function(data){
    console.log(data);
    $("card-content").append(data);
  }, "text");
};

$(".add-card-btn").click(function(){
  $.get("card.html", function(data){
    $("#card-content").append(data);
  });
});

$(".remove-all-card-btn").click(function(){
  $(".card").remove();
});

$(document).ready(function(){
  add_content("Add this content");
  

  //$('#card-content').load("card.html");
  //$('#card-content').hide();
  add_card();
});