var ipc = require('electron').ipcRenderer;
document.addEventListener('keydown', function (evt) {
    //document.getElementById('test').textContent = evt.keyCode;
  });
  
  
 ipc.on('add-new-copy', function(event, message){
   var cardlist = $('.cardlist');
   cardlist.append(cardTemplate(cardlist.children().length +1, message));
  
 });
 
 
 function cardTemplate(title, text){
   
   return `<div class="card">
            <div class="card-content">
              <span class="card-title">`+title+`</span>
              <p>`+text+`</p>
            </div>
            </div>
         `     
 }
      