var panes = {main:{},browse:{},upload:{}, image: {}};

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
    img.onload = function() {
      var canvas = document.querySelector("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
    }
    window.location.hash = "#image";
  };
  pick.onerror = function () { 
    alert("Can't view the image!");
  };
}

panes.upload.camera = function() {
  var rec = new MozActivity({
    name: "record" // Possibly capture in future versions
  });

  rec.onsuccess = function () { 
    var img = document.querySelector("#preview");
    img.src = window.URL.createObjectURL(this.result.blob);
    img.onload = function() {
      var canvas = document.querySelector("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
    }
    window.location.hash = "#image";
  };

  rec.onerror = function () { 
    alert("No taken picture returned");
  };
}

panes.image.filter = function() {
  var canvas = document.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  var im = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = im.data;
  var f = getFilter();
  for (var i = 0, ii = im.data.length; i < ii; i += 4) {
    var r = data[i + 0];
    var g = data[i + 1];
    var b = data[i + 2];
    data[i + 0] = (f[i] / 256) * ((r * .393) + (g *.769) + (b * .189)) ;
    data[i + 1] = (f[i + 1] / 256) * ((r * .349) + (g *.686) + (b * .168));
    data[i + 2] = (f[i + 2] / 256) * ((r * .272) + (g *.534) + (b * .131));
  }
  ctx.putImageData(im, 0, 0);
  function getFilter() {
    var im = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = im.data;
    var filter = [];
    for (var i = 0, ii = im.data.length; i < ii; i += 4) {
      var r = data[i + 0];
      var g = data[i + 1];
      var b = data[i + 2];
    }
    return data;
  }
}

panes.image.upload = function() {
  var canvas = document.querySelector("canvas");
  canvas.toBlob(function(blob) {
    var fd = new FormData();
    //var blob = canvas.mozGetAsFile("foo.png");
    fd.append("image", blob);
    fd.append("key", "6528448c258cff474ca9701c5bab6927");
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://api.imgur.com/2/upload.json");
    xhr.onload = function() {
      if (xhr.status === 200) {
        var url = JSON.parse(xhr.responseText).upload.links.imgur_page;
        new MozActivity({name: "view", data: { type: "url", url: url }});
      }
    }
    xhr.onerror = function() {
      alert("upload error");
    }
    xhr.send(fd);
  }, "image/jpeg", 0.95);
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
  xhr.onload = function() {
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
  };
  xhr.onerror = function() {
    alert("fetch error");
  }
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
      install.className = "show-install";
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
