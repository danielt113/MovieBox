//*******************************************************************************************
//*******************************************************************************************
//*******************************************************************************************
/*****


--------
MovieBox 
https://github.com/danielt113/MovieBox

A desktop application that finds movies and TV shows on your computer and displays them with box art.
--------

--------------------------------------------------
GNU General Public License v3 (GPL-3) 29 June 2007
https://github.com/danielt113/MovieBox/blob/master/LICENSE
--------------------------------------------------

----------
To do list

Remember last episode
For all inputs, when enter clicked, select the checkbox or trigger onclick
Rename dialog use full file name processing
MovieQuery only gets first match, second match when opening movie
	movie expand play loading gif then query tmdb id match

----------


*****/
//*******************************************************************************************
//*******************************************************************************************
//*******************************************************************************************

$( document ).ready(function() {
	window.scrollTo(0, 0);
});

window.onload = function() {
//alert(window.location.host);
	//Load the save file otherwise create a blank one
	loadXMLDoc();

	//Load any saved libraries to allLibraries
	savesExist = retrieveSavedFolders();
	
	//Get list of filepaths that we already have saved in xml
	retrieveSavedFilePaths();

	//Find any removable media and locate volume names to paths
	getLibraries();
	
	var skipSettings = getOption("ask-on-startup",false);
	$("#askEveryTime").prop("checked", skipSettings);
	
	var debugMode = getOption("debug-mode",false);
	$("#debugModeCheck").prop("checked", debugMode);
	
	if (debugMode == 1)
		$("#debugTable").show();
	
	if ($(".CoverArt").length)
		$("#tmdbAttribution").show();
	else
		$("#tmdbAttribution").hide();
	
	//check if there is a cookie to skip settings
	if (skipSettings) {
		pages.settings.onNavigate();
		searchForMovies(skipSettings);
	}
	else {
		pages.settings.navigateTo();
		UpdateDomLinks();
	}
}

function init2() {

	setTimeout(function () {$("#loadingProgress").addClass("invisible");}, 1000);
	setTimeout(function () {setLoadingProgress(0);}, 1000);
	
	//Add temporary boxart for shows since we have all the episodes for them
	for (var i = 0; i < allShows.length; i++) {
		if ((typeof concatSavedShows === "undefined") || (concatSavedShows.indexOf("&" + allShows[i].sTitle.toUpperCase() + "&") < 0)) {
			saveShow(allShows[i], 1);
		}
	}
	
	//Build a concatenated string of all the movie filepaths saved in the xmlDoc (to see if movies we found already exist)
	removeUnfoundMovies();
	
	//Transform and display all the movies that weren't removed from the xmldoc
	$("divDialog").text("Getting box art");
	pages[document.getElementById("cmSort").parentNode.childNodes[0].innerHTML.toLowerCase()].navigateTo();

	//Start querying
	getQueryList();

	//Start querying
	getMovieData(0);

	//Code beyond getMovieData will be executed synchronously, asynchronous code must be put in continueMe()
	
}

function continueMe() {
	
	UpdateDomLinks();
	
	if ($("#problemTable tr").length > 1)
		$("#problemTable").show();
	else
		$("#problemTable").hide();
	
	xmlDoc.save(saveFile);
	
	document.getElementsByTagName("title")[0].innerHTML = "MovieBox";
}

function closeMe() {
	objShell = null;
	objFSO = null;
	xmlDoc = null;
	window.close();
}

