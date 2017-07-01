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
      if (copyValues.length > 0 && currSelected < copyValues.length - 1) {
        changeSelected = true;
        currSelected += 1;
      }
      ipc.send('log', currSelected);
      break;
    case 13: // ENTER
      if (copyValues.length > 0) {
        // console.log(copyValues[currSelected]);
        const selectedValue = copyValues[currSelected];
        // Removes the selected value from the array
        // it gets re-added automatically by the clipboardWatcher
        if (currSelected !== 0) {
          copyValues.splice(currSelected, 1);
        }
        ipc.send('set-clipboard-value', selectedValue);
        ipc.send('toggleChildWindow');
      }
      break;
    default:
      break;
  }

  if (changeSelected) {
    $('.darken-2').each(function each() { // unnamed function breaks functionality
      $(this).removeClass('darken-2');
    });
    $(`#card${currSelected}`).addClass('darken-2');
  }
});

function cardTemplate(id, title, text) {
  return `<div id="card${id}" class="card-panel blue-grey">
            <span class="white-text">
              ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}
            </span>
          </div>`;
}

function renderList() {
  currSelected = 0;
  const cardlist = $('.cardlist');
  cardlist.html('');
  for (let i = 0; i < copyValues.length; i += 1) {
    cardlist.append(cardTemplate(i, i + 1, copyValues[i]));
  }
  $('.cardlist').children().first().addClass('darken-2');
}

ipc.on('add-new-copy', (event, message) => {
  copyValues.unshift(message);

  renderList();
});
