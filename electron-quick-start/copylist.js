/*jshint esversion: 6 */

let ipc = require('electron').ipcRenderer;

let copyValues = [];
let currSelected = 0;
document.addEventListener('keydown', function (evt) {
    let changeSelected = false;
    switch(evt.keyCode){
      case 38:
        if(copyValues.length >= 0 && currSelected > 0 ){
          changeSelected = true;
          currSelected--;  
        }
        ipc.send('log', currSelected);
        
        break;
      case 40:
        if(copyValues.length > 0 && currSelected < copyValues.length){
          changeSelected = true;
          currSelected++;
        }
        ipc.send('log', currSelected);
        break;
      case 13:
        if(copyValues.length > 0){
          ipc.send('set-clipboard-value', copyValues[currSelected]);
          ipc.send('toggleChildWindow');
        }  
    }
    
    if(changeSelected){
      $('.selected').each(function(e){
        $(this).removeClass('selected');
      });
      $("#card"+currSelected).addClass('selected');
    }
});


 ipc.on('add-new-copy', function(event, message){
   
   copyValues.unshift(message);
   
   renderList();
   
   currSelected = 0;
   $('.cardlist').children().first().addClass('selected');
 });

function renderList(){
  let cardlist = $('.cardlist');
  cardlist.html('');
  for(let i = 0; i < copyValues.length; i++){
    cardlist.append(cardTemplate(i, i+1, copyValues[i]));
  }
}
 function cardTemplate(id, title, text){
   return `<div id="card`+id+`" class="card">
            <div class="card-content">
              <span class="card-title">`+title+`</span>
              <p id="value"><pre>`+text.replace(/&/g, '&amp;').replace(/</g, '&lt;')+`</pre></p>
            </div>
            </div>
          `;
          
               
 }
