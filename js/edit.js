function get_func_content_div(col_num){
  var func_content_div = document.createElement('div');
  func_content_div = $(func_content_div);
  func_content_div.append("<table></table>");
  func_content_div.addClass("func-content");
  func_content_div.addClass("col-" + col_num);
  var table = func_content_div.children().first();
  for(i=0; i<5; i++){
    table.append("<tr><td class='title-name'></td><td></td></tr>")
  }
  return func_content_div
}

function create_func_content_table(json, col_num, parent_div){
  func_content_div = get_func_content_div(col_num);
  func_content_table = func_content_div.children().first();
  
  //insert data
  Object.keys(json).forEach(function(key, idx, arr){
    tr = func_content_table.children().eq(idx);
    
    if(key != "subprocess"){
      tr.children().eq(0).text(key);
      tr.children().eq(1).text(json[key]);
    }else{
      tr.children().eq(0).text(key);
      json[key].forEach(function(item, idx, arr){
        text = tr.children().eq(1).html();
        new_link = document.createElement('a');
        new_link.setAttribute('href', '#');
        new_link.setAttribute('class', 'subprocess-function');
        new_link.innerHTML = item['function']
        tr.children().eq(1).html(text + new_link.outerHTML + '<br>');
      });
    }
  });
  
  //add to DOM
  if(parent_div == undefined){
    $('body').append(func_content_div);
  }else{
    parent_div.after(func_content_div);
  }
  
  //generate subprocess table
  json['subprocess'].forEach(function(item, idx, arr){
    console.log(item);
    create_func_content_table(item, col_num+1, func_content_div);
  });
}

function get_nest_node(json, depth){
  if(depth != 0){
    current_node = json['subprocess']
    get_nest_node(json, depth-1);
  }
  
  return;
}

function search_json_node(col_num, func_name, json){
  
}

$(document).ready(function(){
  $.getJSON("format.json", function(json){
//    create_func_content_table(json, 0);
    
    //create subprocess table event
    $(".subprocess-function").click(function(event){
//      current_div = event.target.closest("div");
//      col_num = current_div.className.split('col-')[1];
//      col_num = Number(col_num) + 1;
//      func_name = $(this).text();
//      node = search_json_node(col_num, func_name, json);
//      console.log(node);
//      
//      create_func_content_table(null ,col_num)
    });
  });
});