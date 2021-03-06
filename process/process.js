import { includeHTML } from '../include_html.js'

const ANIMATION_TIME = 500;
const closeModal = document.getElementById('close-modal');
const modal = document.getElementsByClassName('modal')[0];
const svgPath = document.getElementById('svg-path');
let max_col = 0;

// TODO: pack the related function into an object

function get_table(row, col) {
  let table = $(document.createElement('table'));
  for (let r = 0; r < row; r++) {
    let tr = $(document.createElement('tr'));
    for (let c = 0; c < col; c++) {
      let td = $(document.createElement('td'));
      if (c == 0) {
        td.addClass('key');//TODO use <th> is better
      } else {
        td.addClass('value');
      }
      tr.append(td);
    }
    table.append(tr);
  }

  return table;
}

function insert_data_to_table(table, json) {
  let index = 0;

  for (let key in json) {
    if (key != 'subprocess') {
      table.children().eq(index).children().eq(0).text(key);
      table.children().eq(index).children().eq(1).html(json[key]);
    } else {
      table.children().eq(index).children().eq(0).text(key);
      let text = '';
      for (let sub_p of json[key]) {
        text += sub_p['function'] + '\n';
      }
      table.children().eq(index).children().eq(1).text(text);
      // TODO: deal with subprocess
    }
    index++;
  }
  //  console.debug(table.children().eq(0));
}


// Inser single json data into the table
// Wrap the table into a div and reture
function get_single_data_card(json, col_idx, arr_idx, parent_index) {
  console.debug(json['function']);
  console.debug('col:' + col_idx, 'arr_idx:' + arr_idx, 'parent:' + parent_index);
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
  div_card.addClass('arrIdx-' + arr_idx);
  div_card.addClass('parent-' + parent_index);
  div_card.append(table);

  console.debug(div_card.attr('class'));
  return div_card;
}


// Parse the josn data and generate the div.card html
// Store these div into array and return
function parse_json_to_gen_card(json, col_index, sub_index, parent_queue, arr) {
  console.debug(json['function'], 'COL:' + col_index, 'SUB:' + sub_index, 'PARENT_IDX:' + parent_queue, 'ARR_LEN:' + arr.length);
  // Get template recursively
  [json].forEach(function (item, idx) {
    // Get template of single json data
    let parent_index = parent_queue[parent_queue.length - 1];
    console.debug(parent_queue);
    let card = get_single_data_card(item, col_index, arr.length, parent_index);
    // Append data to array
    arr.push(card);
    //Push current arr index into parent index queue
    parent_queue.push(arr.length - 1);

    // Generate subproccess template
    const key = 'subprocess'
    if (item[key].length != 0) {
      for (let sub_num = 0; sub_num < item[key].length; sub_num++) {
        parse_json_to_gen_card(
          item[key][sub_num],
          col_index + 1,
          sub_num,
          parent_queue,
          arr
        );
      }
    }

    parent_queue.pop();
  });
}

// Create a div with class 'row'
// Return the div element
function create_div_row(container) {
  let div_row = $(document.createElement('div')).addClass('row')
  container.append(div_row);
  return div_row;
}

// Create divs with col classes and index
function create_div_col(container, col_count) {
  for (let i = 0; i < col_count; i++) {
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
function init_template(card_arr) {
  let container = $('.container');//This element has already exist in html file
  let div_row = create_div_row(container);
  let col_count = 10;//TODO: get the count of col
  create_div_col(div_row, col_count);

  return container;
}

function get_col_num_from_class(class_str) {
  let col_num = -1;
  let class_arr = class_str.split(' ');
  for (let idx in class_arr) {
    if (class_arr[idx].startsWith('col-')) {
      col_num = class_arr[idx].split('col-')[1];
      break;
    }
  }
  return col_num;
}

// Append the cards to corresponding div col
function arrange_card(container, card_arr) {
  let div_row = container.children().eq(0);
  console.debug("arr lenghth: " + card_arr.length);
  for (let idx in card_arr) {
    let card = card_arr[idx];
    let col_num = get_col_num_from_class(card.attr('class'));
    div_row.children().eq(col_num).append(card);
  }

}


// Action
function reset_col_cards(col_index, parent_index, card_arr) {
  console.debug('Reset: ', 'col:' + col_index, 'show card that parent is:' + parent_index);
  let div_col = $('.col').eq(col_index);
  div_col.children().hide(ANIMATION_TIME);
  for (let i = 0; i < div_col.children().length; i++) {
    let div_card = div_col.children().eq(i);
    let template_index = get_template_index(div_card);
    if (template_index['parent'] == parent_index) {
      div_card.show(ANIMATION_TIME);
    }
  }
  //  div_col.children().remove();
  //  for(let i=0; i<card_arr.length; i++){
  //    let template_index = get_template_index(card_arr[i]);
  //    if(template_index['parent'] == parent_index){
  //      $('.col.col-'+col_index).append(card_arr[i]);
  //    }
  //  }
}

function get_template_index(obj) {
  let classes = obj.attr('class').split(' ');
  let col_num = -1;
  let arr_idx = -1
  let parent_num = -1;
  for (let i = 0; i < classes.length; i++) {
    if (classes[i].startsWith('col-')) {
      col_num = classes[i].split('col-')[1];
    } else if (classes[i].startsWith('arrIdx-')) {
      arr_idx = classes[i].split('arrIdx-')[1];
    } else if (classes[i].startsWith('parent-')) {
      parent_num = classes[i].split('parent-')[1];
    }
  }

  return { 'col': col_num, 'arrIdx': arr_idx, 'parent': parent_num };
}

function update_path(selected_card, template_index) {
  //clear next col path
  for (let i = template_index.col; i < max_col; i++) {
    console.log('p' + i);
    $('.p' + i).remove();
  }

  // draw path
  let parent = document.querySelector('.arrIdx-' + template_index.parent);
  if (parent) {
    //get path start point (parent card)
    parent = $(parent);
    let p_vertical = Math.round(parent.position().top + parent.height() / 2);
    let p_horizontal = Math.round(parent.position().left + parent.width());

    //get path end point (selected card)
    let s_vertical = Math.round(selected_card.position().top + selected_card.height() / 2);
    let s_horizontal = Math.round(selected_card.position().left + 5);

    //get middle point
    let middle_point = Math.round(p_horizontal + (s_horizontal - p_horizontal) / 2);

    let path = $('<path></path>');
    path.attr('d',
      'M' +
      p_horizontal + ' ' + p_vertical + ' ' +
      'L' +
      middle_point + ' ' + p_vertical + ' ' +
      'L' +
      middle_point + ' ' + s_vertical + ' ' +
      'L' +
      s_horizontal + ' ' + s_vertical
    );

    path.attr('class', 'p' + template_index.col);
    $(svgPath).append(path);
    $(svgPath).html($(svgPath).html());
  }

}

function click_div_card(selected_card, card_arr) {
  let template_index = get_template_index(selected_card);
  console.debug('Selected card ', 'col:' + template_index['col'], 'arrIdx:' + template_index['arrIdx'], 'parent:' + template_index['parent'])

  // Clear sub sub div.col
  $('.col').slice(Number(template_index['col']) + 2).children().hide(ANIMATION_TIME);
  // Mark selected card
  $('.card').removeClass('focus');
  selected_card.addClass('focus');
  // Reset sub div col
  reset_col_cards(Number(template_index['col']) + 1,
    Number(template_index['arrIdx']),
    card_arr);

  //draw path
  update_path(selected_card, template_index);

  //scroll
  window.scroll(selected_card.position().left - selected_card.width() / 0.7, selected_card.position().top - selected_card.height() / 3);
}

function parse_json() {
  return new Promise(function (resolve, reject) {
    $.getJSON("format.json", function (json) {
      // Parse each json data to div card
      // Then store these div object to a array
      let card_arr = [];
      let parent_queue = [];
      parse_json_to_gen_card(json, 0, 0, parent_queue, card_arr);
      // Create the container for contain div card
      let container = init_template(card_arr);
      // Insert the cards to div.col
      arrange_card(container, card_arr);
      // Bind action
      $('div.card').bind('click', function () {
        click_div_card($(this), card_arr);
      });
      //init UI rendering
      click_div_card($('div.card.col-0').eq(0), card_arr);

      resolve('ok');
    });
  });
}

function init_svg() {
  $('#svg-path').height(document.body.scrollHeight);
  $('#path-container').height(document.body.scrollHeight);

  // find max col number
  $('.col').each(function () {
    let col_num = $(this).attr('class').split('col-')[1];
    if (max_col < col_num) {
      max_col = col_num;
    }
  });
}

$(document).ready(function () {
  includeHTML();

  parse_json().then(function () {
    init_svg();
  });

  //control modal
  closeModal.onclick = function () {
    modal.style.display = 'none';
  }

  //click first card
  $(document).on('click', '.show-modal-btn', function () {
    setTimeout(function () {
      let offset_x = document.documentElement.scrollLeft.toString();
      let offset_y = document.documentElement.scrollTop.toString();
      modal.style.left = offset_x + 'px';
      modal.style.top = offset_y + 'px';
      modal.style.display = 'block';
    }, 500);
  });
});