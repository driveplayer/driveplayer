var CLIENT_ID = '1084390841753-esl5k5jcothmlthjo67dv36ub9o029q5.apps.googleusercontent.com	 ';
var API_KEY = 'AIzaSyAlr01rzvVSEDgvJykLYfVXmjeFwLbX_bc';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');
var PRE = document.getElementById('content');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        listFiles();
    } else {
        window.location.href = "/auth.html";
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function setSong(name, link) {
    document.getElementById('song_name').innerHTML = name;
    document.getElementById('song').src = link;
}

function appendPre(name, link) {
    link = link || "";
    if (link === "") {
        PRE.innerHTML += "<h3>" + name + "</h3>"
    } else {
        // PRE.innerHTML += Stringformat(
        //     "<a onclick='setSong(\"{0}\",\"{1}\")'><h3>{0}</h3></a>", name, link
        // );
        PRE.innerHTML += "<a onclick='setSong(\"${name}\",\"${link}\")'><h3>${name}</h3></a>";
    }
}

function Stringformat(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
};

function listFiles(nextPage) {
    nextPage = nextPage || "";
    var params = {
        'pageSize': 100,
        'fields': "nextPageToken, files(id, name, webContentLink)",
        'q': "mimeType='audio/mpeg'",
        'pageToken': nextPage
    };
    gapi.client.drive.files.list(params)
        .then(function (response) {
            nextPage = response.result.nextPageToken;
            console.log(response);
            console.log(nextPage);
            var files = response.result.files;
            var n = 0;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    appendPre(file.name, file.webContentLink.toString());
                    n++;
                }
            } else {
                appendPre('No files found.');
            }
            appendPre("--- page --- " + n);
            if (response.result.nextPageToken && response.result.nextPageToken !== "") {
                listFiles(response.result.nextPageToken);
            }
        });
}
