function loadXMLDoc() {
	xmlDoc.async = 'false';
	xmlDoc.load(saveFile);
	if (xmlDoc.parseError.errorCode == -2146697210) { //file doesn't exist
		var file = objFSO.CreateTextFile(saveFile);
		file.WriteLine('<?xml version="1.0" encoding="UTF-8"?><Movies></Movies>') //Create properly formatted xml
		file.Close();
		xmlDoc.load(saveFile);
		if (xmlDoc.parseError.errorCode) loadXMLDoc();
	}
	else if (xmlDoc.parseError.errorCode == -2147024893) { //folder doesn't exist
		var a = objFSO.CreateFolder(saveFileFolder);
		loadXMLDoc();
	}
	else if (xmlDoc.parseError.errorCode) {
		alert(saveFile + " is being accessed by another program. MovieBox will now close.");
		closeMe();
	}
}

function saveShow(objShow, isPlaceholder) {
	var ThisRow;

    if ((concatSavedShows === undefined) || (concatSavedShows.toUpperCase().indexOf("&" + objShow.sTitle.toUpperCase() + "&") < 0)) {
		if (!isPlaceholder) {
			removeTemporaryBoxart(objShow.sTitle);
		}
		
		ThisRow = xmlDoc.createElement("Show");
		xmlDoc.documentElement.appendChild(ThisRow);
		var x = xmlDoc.createElement("Title");var y = xmlDoc.createTextNode(objShow.sTitle);x.appendChild(y);ThisRow.appendChild(x);
		var x = xmlDoc.createElement("Poster");var y = xmlDoc.createTextNode(objShow.sPoster);x.appendChild(y);ThisRow.appendChild(x);
		var x = xmlDoc.createElement("Year");var y = xmlDoc.createTextNode(objShow.sYear);x.appendChild(y);ThisRow.appendChild(x);
		var x = xmlDoc.createElement("ID");var y = xmlDoc.createTextNode(objShow.sID);x.appendChild(y);ThisRow.appendChild(x);
	}
    else {
		var allRows = xmlDoc.getElementsByTagName("Show");
		for (var i = 0; i < allRows.length; i++) {
			if (allRows[i].getElementsByTagName("Title")[0].childNodes[0].nodeValue.toUpperCase().replace(/[\.']/,"") == objShow.sTitle.toUpperCase().replace(/[\.']/,""))
				ThisRow = allRows[i];
		}
	}
	
	//for each episode
	
	for (var i = 0; i < objShow.sEpisodes.length; i++) {
		if ((concatSavedEpisodes === undefined) || (concatSavedEpisodes.indexOf(objShow.sEpisodes[i].sFilepath) < 0)) {
			var ThisEpisode = xmlDoc.createElement("Episode"); 
			ThisRow.appendChild(ThisEpisode);
			var x = xmlDoc.createElement("Title");var y = xmlDoc.createTextNode(objShow.sEpisodes[i].sTitle);x.appendChild(y);ThisEpisode.appendChild(x);
			var x = xmlDoc.createElement("Overview");var y = xmlDoc.createTextNode(objShow.sEpisodes[i].sOverview);x.appendChild(y);ThisEpisode.appendChild(x);
			var x = xmlDoc.createElement("SeasonNum");var y = xmlDoc.createTextNode(objShow.sEpisodes[i].sSeason);x.appendChild(y);ThisEpisode.appendChild(x);
			var x = xmlDoc.createElement("EpisodeNum");var y = xmlDoc.createTextNode(objShow.sEpisodes[i].sEpisode);x.appendChild(y);ThisEpisode.appendChild(x);
			var x = xmlDoc.createElement("Original");var y = xmlDoc.createTextNode(objShow.sEpisodes[i].sOriginal);x.appendChild(y);ThisEpisode.appendChild(x);
			var x = xmlDoc.createElement("Filepath");var y = xmlDoc.createTextNode(objShow.sEpisodes[i].sFilepath);x.appendChild(y);ThisEpisode.appendChild(x);
			var x = xmlDoc.createElement("Directory");var y = xmlDoc.createTextNode(objShow.sEpisodes[i].sDirectory);x.appendChild(y);ThisEpisode.appendChild(x);
			var x = xmlDoc.createElement("Quality");var y = xmlDoc.createTextNode(objShow.sEpisodes[i].sQuality);x.appendChild(y);ThisEpisode.appendChild(x);
			var x = xmlDoc.createElement("Rating");var y = xmlDoc.createTextNode(objShow.sEpisodes[i].sRating);x.appendChild(y);ThisEpisode.appendChild(x);
			var x = xmlDoc.createElement("VoteCount");var y = xmlDoc.createTextNode(objShow.sEpisodes[i].sVoteCount);x.appendChild(y);ThisEpisode.appendChild(x);
		}
	}
}

function deleteSavedFolders() {
	var allRows = xmlDoc.getElementsByTagName("Folder");
	for (var i = 0; i < allRows.length; i++) {
		allRows[i].parentNode.removeChild(allRows[i]);
	}
}

function retrieveSavedFolders() {
	var allRows = xmlDoc.getElementsByTagName("Folder");
	var ret1 = allRows.length;
	if (allRows.length > 0) {
		for (var i = 0; i < allRows.length; i++) {
			if (allRows[i].getAttribute("type") == "fixed") {
				
				//tableRow("libraryTable", allRows[i].getElementsByTagName("Path")[0].childNodes[0].nodeValue);
				allLibraries.push(new Library(allRows[i].getElementsByTagName("Path")[0].childNodes[0].nodeValue, allRows[i].getElementsByTagName("MaxDepth")[0].childNodes[0].nodeValue, false, 0, allRows[i].getElementsByTagName("VolumeName")[0].childNodes[0].nodeValue, "fixed", -allRows[i].getElementsByTagName("Enabled")[0].childNodes[0].nodeValue));
			}
			else
				allLibraries.push(new Library("", allRows[i].getElementsByTagName("MaxDepth")[0].childNodes[0].nodeValue, false, 0, allRows[i].getElementsByTagName("VolumeName")[0].childNodes[0].nodeValue));
			//Push to allLib
		}
		return ret1;
	}
	else
		return 0;
}

function getOption(optName, def) {
	var allRows = xmlDoc.getElementsByTagName("Option");
	for (var i = 0; i < allRows.length; i++) {
		if (allRows[i].getAttribute("name") == optName) {
			return (allRows[i].childNodes[0].nodeValue == 0)?false:true;
		}
	}
	return def;
}

function setOption(optName, optValue) {
	var allRows = xmlDoc.getElementsByTagName("Option");
	for (var i = 0; i < allRows.length; i++) {
		if (allRows[i].getAttribute("name") == optName) {
			allRows[i].childNodes[0].nodeValue = optValue;
			return;
		}
	}
	var thisOption = xmlDoc.createElement("Option");
	thisOption.setAttribute("name", optName);
	var y = xmlDoc.createTextNode(optValue);
	thisOption.appendChild(y);
	xmlDoc.documentElement.appendChild(thisOption);
}

function saveFolder(objLibrary) {
    var ThisRow = xmlDoc.createElement("Folder");
    xmlDoc.documentElement.appendChild(ThisRow);
	ThisRow.setAttribute("type", objLibrary.sType);
	var x = xmlDoc.createElement("Path");var y = xmlDoc.createTextNode(objLibrary.sDirectory);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("MaxDepth");var y = xmlDoc.createTextNode(objLibrary.sMaxDepth);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("VolumeName");var y = xmlDoc.createTextNode(objLibrary.sVolumeName);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("MovieCount");var y = xmlDoc.createTextNode("0");x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Enabled");var y = xmlDoc.createTextNode(objLibrary.sEnabled);x.appendChild(y);ThisRow.appendChild(x);
}

function retrieveSavedFilePaths() {
	var allRows = xmlDoc.getElementsByTagName("Movie");

	for (var i = 0; i < allRows.length; i++) {
		//Only save if we have boxart, otherwise we will requery
		if (allRows[i].getElementsByTagName("Poster")[0].firstChild != null)
			concatSavedFiles += allRows[i].getElementsByTagName("Filepath")[0].childNodes[0].nodeValue;
		else
			allRows[i].parentNode.removeChild(allRows[i]);
	}
	allRows = xmlDoc.getElementsByTagName("Episode");
	for (var i = 0; i < allRows.length; i++) {
		if (allRows[i].getElementsByTagName("Title")[0].firstChild != null)
			concatSavedEpisodes += allRows[i].getElementsByTagName("Filepath")[0].childNodes[0].nodeValue;
		else
			allRows[i].parentNode.removeChild(allRows[i]);
	}
	allRows = xmlDoc.getElementsByTagName("Show");
	for (var i = 0; i < allRows.length; i++) {
		concatSavedShows += "&" + allRows[i].getElementsByTagName("Title")[0].childNodes[0].nodeValue.toUpperCase() + "&";
	}
}

function removeUnfoundMovies() {//To add: save movies that are from a removable source
	for (var i = 0; i < allMovies.length; i++) {
		concatFoundFiles += allMovies[i].sFilePath;
	}
	var aFilePath, allRows = xmlDoc.getElementsByTagName("Movie");
	for (var i = 0; i < allRows.length; i++) {
		aFilePath = allRows[i].getElementsByTagName("Filepath")[0].childNodes[0].nodeValue;
		if ((typeof concatFoundFiles === "undefined") || (concatFoundFiles.indexOf(aFilePath) < 0)) {
			allRows[i].parentNode.removeChild(allRows[i]);
		}
	}
	
	for (var i = 0; i < allShows.length; i++) {
		concatFoundShows += "&" + allShows[i].sTitle + "&";
	}
	allRows = xmlDoc.getElementsByTagName("Show");
	for (var i = 0; i < allRows.length; i++) {
		//not the & on the end of the show name (ensure when we match we capture only the entire show title
		aFilePath = "&" + allRows[i].getElementsByTagName("Title")[0].childNodes[0].nodeValue + "&";
		if ((concatFoundShows !== undefined) && (concatFoundShows.toUpperCase().indexOf(aFilePath.toUpperCase()) < 0)) {
			allRows[i].parentNode.removeChild(allRows[i]);
		}
	}
	
	//concatFoundEpisodes is already made in Main2
	allRows = xmlDoc.getElementsByTagName("Episode");
	for (var i = 0; i < allRows.length; i++) {
		aFilePath = allRows[i].getElementsByTagName("Filepath")[0].childNodes[0].nodeValue;
		if ((concatFoundEpisodes !== undefined) && (concatFoundEpisodes.indexOf(aFilePath) < 0)) {
			allRows[i].parentNode.removeChild(allRows[i]);
		}
	}
	
}

function removeTemporaryBoxart(filePath) {
	if (String(filePath).indexOf("\\")  > -1) {
		var allRows = xmlDoc.getElementsByTagName("Movie");
		for (var i = 0; i < allRows.length; i++) {
			if (allRows[i].getElementsByTagName("Filepath")[0].childNodes[0].nodeValue == filePath) {
				allRows[i].parentNode.removeChild(allRows[i]);
				break;
			}
		}
	}
	else {
		var allRows = xmlDoc.getElementsByTagName("Show");
		for (var i = 0; i < allRows.length; i++) {
			if (allRows[i].getElementsByTagName("Title")[0].childNodes[0].nodeValue.toUpperCase() == filePath.toUpperCase()) {
				allRows[i].parentNode.removeChild(allRows[i]);
				break;
			}
		}
	}
}

function SaveMovie(objMovie, isPlaceholder) {
	if (!isPlaceholder) {
		removeTemporaryBoxart(objMovie.sFilePath);
	}
    var ThisRow = xmlDoc.createElement("Movie");
    xmlDoc.documentElement.appendChild(ThisRow);
    ThisRow.setAttribute("OriginalQuery", objMovie.sQuery);
	var x = xmlDoc.createElement("Filepath");var y = xmlDoc.createTextNode(objMovie.sFilePath);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Directory");var y = xmlDoc.createTextNode(objMovie.sDirectory);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Title");var y = xmlDoc.createTextNode(objMovie.sTitle);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Poster");var y = xmlDoc.createTextNode(objMovie.sPoster);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Year");var y = xmlDoc.createTextNode(objMovie.sYear);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Rating");var y = xmlDoc.createTextNode(objMovie.sRating);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("VoteCount");var y = xmlDoc.createTextNode(objMovie.sVoteCount);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Synopsis");var y = xmlDoc.createTextNode(objMovie.sSynopsis);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Runtime");var y = xmlDoc.createTextNode(objMovie.sRuntime);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Release");var y = xmlDoc.createTextNode(objMovie.sRelease);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Quality");var y = xmlDoc.createTextNode(objMovie.sQuality);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Budget");var y = xmlDoc.createTextNode(objMovie.sBudget);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Trailer");var y = xmlDoc.createTextNode(objMovie.sTrailer);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Tagline");var y = xmlDoc.createTextNode(objMovie.sTagline);x.appendChild(y);ThisRow.appendChild(x);
	var x = xmlDoc.createElement("Size");var y = xmlDoc.createTextNode(objMovie.sSize);x.appendChild(y);ThisRow.appendChild(x);
    //JSON Genre List (just an array)
    for (i = 0; i < objMovie.JSONGenreList.length; i++) {
        var x = xmlDoc.createElement("Genre");
        var y = xmlDoc.createTextNode(objMovie.JSONGenreList[i].name);
        x.appendChild(y);
        ThisRow.appendChild(x);
    }

    return true;
}