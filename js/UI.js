var panes = {main:{},browse:{},upload:{}};
panes.browse.visible = function() {
  loadSubreddit();
}

window.location.hash = "#main";
window.onhashchange = function() {
  var pane = window.location.hash.replace("#","");
  document.body.dataset.pane = pane;
  if (panes[pane].visible) {
    panes[pane].visible();
  }
}

var rSel = document.querySelector("#select-subreddit");
rSel.onchange = loadSubreddit;

function loadSubreddit() {
  var r = rSel.value;
  var ul = document.querySelector("#browse-images");
  ul.innerHTML = "";

  var url = "https://api.imgur.com/3/gallery/r/" + r;

  // Create XHR
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader('Authorization', "Client-ID 6528448c258cff474ca9701c5bab6927");
  xhr.addEventListener("load", function () {
    alert(xhr.status);
    if (xhr.status === 200) {
      console.log("Image retrieved");
    }
  }, false);
  xhr.send(); 
}
