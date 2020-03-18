// TODO: pack the related function into an object

function get_table(row, col){
  let table = $(document.createElement('table'));
  for(let r=0; r<row; r++){
    let tr = $(document.createElement('tr'));
    for(let c=0; c<col; c++){
      let td = $(document.createElement('td'));
      if(c == 0){
        td.addClass('key');//TODO use <th> is better
      }else{
        td.addClass('value');
      }
      tr.append(td);
    }
    table.append(tr);
  }

  return table;
}

function insert_data_to_table(table, json){
  let index = 0;
  for(key in json){
    if(key != 'subprocess'){
      table.children().eq(index).children().eq(0).text(key);
      table.children().eq(index).children().eq(1).text(json[key]);
    }else{
      table.children().eq(index).children().eq(0).text(key);
      // TODO: deal with subprocess
    }
    index++;
  }
//  console.debug(table.children().eq(0));
}


// Inser single json data into the table
// Wrap the table into a div and reture
function get_single_data_card(json, col_idx, sub_idx){
  // Create json table object
  let row = Object.keys(json).length;
  const col = 2;//this parameter related to insert_data_to_table() and get_table()
  let table = get_table(row, col);
  
  // Insert json data to the table
  insert_data_to_table(table, json);
  
  // Set html class for manipulate
  let div_card = $(document.createElement('div'));
  div_card.addClass('card');
  div_card.addClass('col-' + col_idx);
  div_card.addClass('sub-' + sub_idx);
  div_card.append(table);
  
  console.debug(div_card.attr('class'));
  return div_card;
}


// Parse the josn data and generate the div.card html
// Store these div into array and return
function parse_json_to_gen_card(json, col_index, sub_index, arr){
  console.debug(json['function'], 'COL:'+col_index, 'SUB:'+sub_index, 'ARR_LEN:'+arr.length);
  // Get template recursively
  [json].forEach(function(item, idx){
    // Get template of single json data
    let card = get_single_data_card(item, col_index, sub_index);
    
    // Append data to array
    arr.push(card);

    // Generate subproccess template
    const key = 'subprocess'
    if(item[key].length != 0){
      for(let sub_num=0; sub_num<item[key].length; sub_num++){
        parse_json_to_gen_card(
          item[key][sub_num],
          col_index+1,
          sub_num,
          arr
        );
      }
    }
  });
}

// Figure out how many div col needs to be create
function get_col_count(card_arr){
  let last_card = card_arr[card_arr.length-1];
  let classes = last_card.attr('class').split(' ');
  let col_count = -1;
  
  for(let i=0; i<classes.length; i++){
    if (classes[i].startsWith('col-')){
      col_count = Number(classes[i].split('col-')[1]) + 1;
      console.debug('col_count: ' + col_count);
      break;
    }
  }
  
  return col_count;
}

// Create a div with class 'row'
// Return the div element
function create_div_row(container){
  let div_row = $(document.createElement('div')).addClass('row')
  container.append(div_row);
  return div_row;
}

// Create divs with col classes and index
function create_div_col(container, col_count){
  for(let i=0; i<col_count; i++){
    let div_col = $(document.createElement('div'));
    div_col.addClass('col');
    div_col.addClass('col-' + i);
    container.append(div_col);
  }
}


// Init the template and return container
// **NOTE**
// This is container structure:
// div.container  > div.row > div.col1, 2, 3... and so on
// The card in card_arr with be insert to div.col later
function init_template(card_arr){
  let container = $('.container');//This element has already exist in html file
  let div_row = create_div_row(container);
  let col_count = get_col_count(card_arr);
  create_div_col(div_row, col_count);
  return container;
}

function get_col_num_from_class(class_str){
  let col_num = -1;
  class_arr = class_str.split(' ');
  for(idx in class_arr){
    if(class_arr[idx].startsWith('col-')){
      col_num = class_arr[idx].split('col-')[1];
      break;
    }
  }
  return col_num;
}

// Append the cards to corresponding div col
function arrange_card(container, card_arr){
  let div_row = container.children().eq(0);
  console.debug("arr lenghth: " + card_arr.length);
  for(idx in card_arr){
    let card = card_arr[idx];
    col_num = get_col_num_from_class(card.attr('class'));
    div_row.children().eq(col_num).append(card);
  }
  
}



// Action
function clear_sub_col(col_num){
  console.log(col_num);
  $('.col').slice(col_num+2).hide();
}

function get_col_sub_number(obj){
  classes = obj.attr('class').split(' ');
  let col_num = -1;
  let sub_num = -1;
  for(let i=0; i<classes.length; i++){
    if(classes[i].startsWith('col-')){
      col_num = classes[i].split('col-')[1];
    }else if(classes[i].startsWith('sub-')){
      sub_num = classes[i].split('sub-')[1];
    }
  }
    
  return {'col': col_num, 'sub': sub_num};
}

function click_div_card(){
  let template_index = get_col_sub_number($(this));
  clear_sub_col(template_index['col']);
}

$(document).ready(function(){
  $.getJSON("format.json", function(json){
    
    // Parse each json data to div card
    // Then store these div object to a array
    let card_arr = [];
    parse_json_to_gen_card(json, 0, 0, card_arr);
    
    // Create the container for contain div card
    let container = init_template(card_arr);
    
    // Insert the cards to div.col
    arrange_card(container, card_arr);
    
    // Bind action
    $('div.card').bind('click', click_div_card);
  })
});