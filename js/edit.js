


function create_table(){
  $.getJSON("format.json", function(json){
    data_lu = $(".func-content-lu");
    Object.keys(json).forEach(function(key, idx, arr){
      data_lu.append("<li><b>{0}</b>: {1}</li>".format(key, json[key]));
    });
  });

}

$(document).ready(function(){
  create_table();
});