var database = firebase.database();
var USER_ID = window.location.search.match(/\?id=(.*)/)[1];

$(document).ready(function() {
  getPostsFromDB();
  $(".add-posts").click(addPostsClick);
  getFriendsPosts();
  userInfo();
});

function addPostsClick(event) {
  event.preventDefault();

  var newPost = $(".add-post-input").val();
  var visibility = $('input[name=visibility]:checked').val();
  var postFromDB = addPostToDB(newPost, visibility);

  createListItem(newPost, postFromDB.key);
  $(".add-post-input").val("");
}

function addPostToDB(text, visibility) {
  return database.ref("posts/" + USER_ID).push({
    text: text,
    visibility: visibility,
  });
}

function getPostsFromDB() {
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
  $(".posts-list").prepend(`
    <div class="post-box">
      <div class="post-box-header"><span class="current-user-name"></span></div>
      <div class="post-box-main">
        <i class="fas fa-user-circle fa-4x text-secondary mr-3"></i>
        <span id="post-text-${key}">${text}</span>
      </div>
      <div class="post-box-footer">
        <button type=button" id="edit-post-${key}"><i class="far fa-edit"></i> Editar</button>
        <button type=button" id="delete-post-${key}"><i class="far fa-trash-alt"></i> Deletar</button>
      </div>
    </div>`);

  $(`#edit-post-${key}`).click(function() {
    $(this).replaceWith(`<button id="save-post-${key}"><i class="far fa-heart"></i> Salvar</button>`);
    $(`#post-text-${key}`).attr('contentEditable', 'true').focus(function(){
      $(`#save-post-${key}`).click(function() {
        var editedPost = $(`#post-text-${key}`).html();
        database.ref("posts/" + USER_ID + "/" + key + "/text").set(editedPost);
        $(`#post-text-${key}`).attr('contentEditable', 'false');
        $(this).replaceWith(`<button id="edit-post-${key}"><i class="far fa-edit"></i> Editar</button>`);
      })
    })
  });

  $(`#delete-post-${key}`).click(function() {
    database.ref("posts/" + USER_ID + "/" + key).remove();
    $(this).parent().parent().remove();
  });

  userInfo();
}

function userInfo() {
  database.ref("users/" + USER_ID).once('value')
  .then(function(snapshot) {
    var userName = snapshot.val().name;
    var userEmail = snapshot.val().email;
    $('.username').html('<i class="fas fa-user"></i> ' + userName + ' <small>(' + userEmail + ')</small>');
    $('.current-user-name').html('Postado por: ' + userName + '<small> (SEU PERFIL)</small>');
  });
}

function getFriendsPosts() {
  var reference = firebase.database().ref('friendship/' + USER_ID);

  reference.on("child_added", function(snapshot) {
    /* console.log(snapshot.val().friend); */
    var followingId = snapshot.val().friend;

    database.ref("posts/" + followingId).once('value')
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        /* console.log(childSnapshot.key); */
        database.ref("users/" + followingId).once('value')
        .then(function(snapshot) {
          /* console.log(snapshot.val().name); */
          $(".posts-list").prepend(`
            <div class="post-box">
              <div class="post-box-header">
              <span id="following-name-${childSnapshot.key}">Postado por: ${snapshot.val().name} <small>(SEGUINDO)</small></span>
              </div>
              <div class="post-box-main">
                <i class="fas fa-user-circle fa-4x text-secondary mr-3"></i>
                <span id="post-text-${childSnapshot.key}">${childSnapshot.val().text}</span>
              </div>
            </div>`);
        });
      });
    });
  });
}

$('.button-all-posts').click(function(){
  window.location = "posts.html?id=" + USER_ID;
})

$('.button-friends-posts').click(function(){
  $('.posts-list').html('');
  getFriendsPosts();
})

$('.button-my-posts').click(function(){
  $('.posts-list').html('');
  getPostsFromDB(); 
})

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
