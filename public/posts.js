var database = firebase.database();
var USER_ID = window.location.search.match(/\?id=(.*)/)[1];

$(document).ready(function() {
  getTasksFromDB();
  $(".add-tasks").click(addTasksClick);
  userInfo();
});

function addTasksClick(event) {
  event.preventDefault();

  var newTask = $(".tasks-input").val();
  var visibility = $('input[name=visibility]:checked').val();
  var taskFromDB = addTaskToDB(newTask, visibility);

  createListItem(newTask, taskFromDB.key);
  $(".tasks-input").val("");
}

function addTaskToDB(text, visibility) {
  return database.ref("posts/" + USER_ID).push({
    text: text,
    visibility: visibility,
  });
}

function getTasksFromDB() {
  database.ref("posts/" + USER_ID).once('value')
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        createListItem(childData.text, childKey)
      });
    });
}

function createListItem(text, key) {
  $(".tasks-list").prepend(`
    <div class="post-box">
      <span class="post-text">${text}</span>
      <br>
      <button class="edit-post">Editar</button>
      <button class="delete-post">Deletar</button>
    </div>`);
  var textElement = $('.post-text:first');
  var editBtn = $('.edit-post:first');

  $('.delete-post').click(function() {
    database.ref("posts/" + USER_ID + "/" + key).remove();
    $(this).parent().remove();
  });
  editBtn.click(function(){
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textElement.text("");
    textElement.append(textArea);
    editBtn.text("Salvar");
    database.ref('posts/' + USER_ID + '/' + key).update({
      text: "",
    });
  })
}

function userInfo() {
  database.ref("users/" + USER_ID).once('value')
  .then(function(snapshot) {
    var userName = snapshot.val().name;
    var userEmail = snapshot.val().email;
    $('.username').html('<i class="fas fa-user"></i> ' + userName + ' <small>(' + userEmail + ')</small>');
  });
}

$('.newsfeed').click(function(){
  window.location = "posts.html?id=" + USER_ID;
})


$('.explore').click(function(){
  window.location = "explore.html?id=" + USER_ID;
})


$('.log-out').click(function() {
  firebase.auth().signOut().then(function() {
    window.location = "index.html";
  }).catch(function(error) {
    alert(error.message);
  });
})