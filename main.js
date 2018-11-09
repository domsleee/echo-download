var get_parent_with_class = (el, class_name) => {
  if (el.className.split(' ').includes(class_name)) return el;
  return get_parent_with_class(el.parentNode, class_name);
}
function log(s) {
  console.log('echo-download:', s);
}
function save_as(url, filename) {
  log('trying to download '+filename);
  var $downloadBtn = $('.downloadBtn')[0];
  var url = $downloadBtn.href;
  $downloadBtn.href = url.replace(/fileName=[^&]*/, 'fileName='+filename);
  log($downloadBtn.href);
  $downloadBtn.click();
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function wait_for(q, length=1, timeout=10) {
  log('waiting for $(' + q + ').length == ' + length);
  var start_time = Date.now();
  while ($(q).length < length && Date.now() - start_time <= timeout*1000) {
    await sleep(100);
  }
  if ($(q).length < length) {
    throw Error('Timed out, get good.');
  }
  log('loaded '+q);
}
function get_name(index) {
  var subj = $('.header')[index].innerText.split(' ')[0];
  const offset = (new Date()).getTimezoneOffset();
  const my_date = new Date($('.date')[index].innerText).getTime();
  const date = new Date(my_date - (offset*60*1000)).toISOString().substring(0, 10);
  return subj + '_' + date + '.mp4';
}
async function close_everything() {
  var i = 0;
  while ($('.downloadBtn').length) {
    var el = get_parent_with_class($('.downloadBtn')[0], 'modal');
    log('attempting to close everything ('+i+')...');
    el.remove();
    await sleep(50);
    i += 1;
  }
  log('everything closed');
}

async function go(index) {
  await close_everything();
  log('opening menu...');
  $('.menu-opener')[index].click();
  await wait_for('.menu-items', 1);
  $('.menu-items a')[1].click();
  await wait_for('.downloadBtn');
  save_as(url, get_name(index));
  await close_everything();
}

function add_styles() {
  var sheet = document.createElement('style')
  sheet.innerHTML = '.download_icon {background-color: firebrick; width:30px; height:30px; border-radius:4px;}';
  sheet.innerHTML += '.download_icon:hover {background-color: darkred;}'
  document.body.appendChild(sheet);
}
function add_buttons() {
  var $videos = $('.menu');
  for (var i = 0; i < $videos.length; i++) {
    var $elem = document.createElement('div');
    var $icon = document.createElement('div');
    $icon.className = 'capture highlight download_icon';
    $elem.appendChild($icon);
    //$icon.style.
    $elem.className = 'menu centered';
    $videos[i].parentNode.appendChild($elem);
  }
  $('.download_icon').click(function(e) {

    var get_index_of = (el) => {
      return Array.prototype.indexOf.call(el.parentNode.children, el);
    }
    var el = get_parent_with_class(e.target, 'class-row');
    var index = get_index_of(el);
    log('Found index: ' + index);
    go(index);
    e.stopPropagation();
  });
}

async function init() {
  log('waiting for menu...');
  await wait_for('.menu-opener', 1, 30);
  add_styles();
  add_buttons();
}

init();
