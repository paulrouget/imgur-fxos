var panes = {main:{},browse:{},upload:{}};

panes.browse.visible = function() {
  loadSubreddit();
}

panes.upload.import = function() {
  var pick = new MozActivity({
    name: "pick",
    data: {
      type: ["image/png", "image/jpg", "image/jpeg"]
       }
  });
  pick.onsuccess = function () { 
    var img = document.querySelector("#preview");
    img.src = window.URL.createObjectURL(this.result.blob);
    window.location.hash = "#image";
  };
  pick.onerror = function () { 
    alert("Can't view the image!");
  };
}

panes.upload.camera = function() {
  var record = document.querySelector("#record");
  if (record) { 
    record.onclick = function () {
      var rec = new MozActivity({
        name: "record" // Possibly capture in future versions
      });

      rec.onsuccess = function () { 
        var img = document.querySelector("#preview");
        img.src = window.URL.createObjectURL(this.result.blob);
        window.location.hash = "#image";
      };

      rec.onerror = function () { 
        alert("No taken picture returned");
      };
    }
  }
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
  ul.innerHTML = "loading...";
  var url = "https://api.imgur.com/3/gallery/r/" + r;
    var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader('Authorization', "Client-ID 83b71d493f3dc0a");
  xhr.addEventListener("load", function () {
    if (xhr.status === 200) {
      var imgs = JSON.parse(xhr.responseText).data;
      var fragment = document.createDocumentFragment();
      var html = "";
      for (var i = 0; i < imgs.length; i++) {
        var link = imgs[i].link;
        var li = document.createElement("li");
        var a = document.createElement("a");
        var img = document.createElement("img");
        li.appendChild(a);
        a.appendChild(img);
        fragment.appendChild(li);
        a.setAttribute("target", "_");
        img.src = a.href = link;
      }
      ul.innerHTML = "";
      ul.appendChild(fragment);
    }
  }, false);
  xhr.send(); 
}



// Install app
if (navigator.mozApps) {
  var checkIfInstalled = navigator.mozApps.getSelf();
  checkIfInstalled.onsuccess = function () {
    if (checkIfInstalled.result) {
      // Already installed
    } else {
      var install = document.querySelector("#install"),
      manifestURL = location.href.substring(0, location.href.lastIndexOf("/")) + "/manifest.webapp";
      /*
      To install a package instead, exchange the above line to this:
      manifestURL = location.href.substring(0, location.href.lastIndexOf("/")) + "/package.manifest";
      */
      install.parentNode.className = "show-install";
      install.onclick = function () {
        var installApp = navigator.mozApps.install(manifestURL);
        /*
        To install a package instead, exchange the above line to this:
        var installApp = navigator.mozApps.installPackage(manifestURL);
        */
        installApp.onsuccess = function(data) {
          install.style.display = "none";
        };
        installApp.onerror = function() {
          alert("Install failed\n\n:" + installApp.error.name);
        };
      };
    }
  };
} else {
  console.log("Open Web Apps not supported");
}
