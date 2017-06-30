/* jshint esversion: 6 */

const ipc = require('electron').ipcRenderer;

const copyValues = [];
let currSelected = 0;

document.addEventListener('keydown', (evt) => {
  let changeSelected = false;
  switch (evt.keyCode) {
    case 38: // UP
      if (copyValues.length >= 0 && currSelected > 0) {
        changeSelected = true;
        currSelected -= 1;
      }
      ipc.send('log', currSelected);
      break;
    case 40: // DOWN
      if (copyValues.length > 0 && currSelected < copyValues.length) {
        changeSelected = true;
        currSelected += 1;
      }
      ipc.send('log', currSelected);
      break;
    case 13: // ENTER
      if (copyValues.length > 0) {
        const selectedValue = copyValues[currSelected];
        // Removes the selected value from the array
        // it gets re-added automatically by the clipboardWatcher
        copyValues.splice(currSelected, 1);
        ipc.send('set-clipboard-value', selectedValue);
        ipc.send('toggleChildWindow');
      }
      break;
    default:
      break;
  }

  if (changeSelected) {
    $('.selected').each(function () { // unnamed function breaks functionality
      $(this).removeClass('selected');
    });
    $('#card' + currSelected).addClass('selected');
  }
});

function cardTemplate(id, title, text) {
  return `<div id="card` + id + `" class="card">
            <div class="card-content">
              <span class="card-title">` + title + `</span>
              <p id="value"><pre>` + text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + `</pre></p>
            </div>
          </div>`;
}

function renderList() {
  const cardlist = $('.cardlist');
  cardlist.html('');
  for (let i = 0; i < copyValues.length; i += 1) {
    cardlist.append(cardTemplate(i, i + 1, copyValues[i]));
  }
}

ipc.on('add-new-copy', (event, message) => {
  copyValues.unshift(message);
  renderList();
  currSelected = 0;
  $('.cardlist').children().first().addClass('selected');
});
