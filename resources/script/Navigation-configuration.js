
pages.settings = new Page("Settings", "resources/pages/settings.html", openSettings, navigateOffSettings, "");
pages.genre = new Page("Genre", "resources/pages/sort.html", openSort, navigateOffSort, "");
pages.alpha = new Page("Alphabetical", "resources/pages/sort.html", openSort, navigateOffSort, "");
pages.date = new Page("Date", "resources/pages/sort.html", openSort, navigateOffSort, "");
pages.searching = new Page("Searching", "resources/pages/searching.html", "", "", "");
pages.search = new Page("Search", "resources/pages/search.html", openSearch, navigateOffSearch, "");
pages.rename = new Page("Rename", "resources/pages/rename.html", "", "", "");
pages.partyplayer = new Page("Party Player", "resources/pages/partyplayer.html", "", "", "");

function openSearch() {
	$("#searchli label").addClass("underline");
	reSortBy("Search");
}
function navigateOffSearch() {
	$("#searchli label").removeClass("underline");
}
	
function navigateOffSettings() {
	clearTable("renameTable");
	clearTable("libraryTable");
	
	$('#searchBoxLabel').removeClass('not-allowed');
	$('#Search').removeClass('not-allowed');
	$('#Search').prop('disabled', false);
	
	$('ul#menu li:first-child').prop('disabled', false);
	$('ul#menu li:first-child a').removeClass('not-allowed');
	$('ul#menu li:first-child div').removeClass('not-allowed');
	$('ul#menu #searchli').prop('disabled', false);
	
	if ($("#debugModeCheck").is(":checked"))
		$("#debugTable").show();
	else
		$("#debugTable").hide();
	
	$("#settings a").removeClass("underline");
}

function openSort() {
	$("#sort > a").addClass("underline");
	reSortBy(document.getElementById("cmSort").parentNode.childNodes[0].innerHTML);
}

function navigateOffSort() {
	$("#sort a").removeClass("underline");
}

function openSettings () {
	
	checkedDirs = new Array();
	showCount = 0;
	sYearInfo = "";
	theQual = "";
	thisSeason = ""; 
	thisEpisode = ""; 
	thisShow = "";
	k = 0;
	doneCount = 1;
	remainCount = 1;
	startDir = "";
	disabledLibraries = 0;
	doneLibraries = 0;
	libraryDepth = 0;
	folderList = new Array();
	iFolder = 0;
	iLibrary = 0;
	maxDepth = 2;
	barWidth = 0;
	allMovies = [];
	allMovieQueries = [];
	allEpisodes = [];
	allShows = [];
	allLibraries = [];
	
	loadXMLDoc();
	
	savesExist = retrieveSavedFolders();

	retrieveSavedFilePaths();

	getLibraries();
	
	for (var i=0; i<allLibraries.length; i++) {
		//var b = "<label class='muted' for='chk" + i + "'><input id='chk" + i + "' type='checkbox' " + ((allLibraries[i].sEnabled==1)?"checked":"") + " onchange='chkChange(this)'></input><small> (" + ((allLibraries[i].sEnabled)?"Yes":"No") + ")</small></label>"
		var c = '<a class="link underline folder-link" id="chk' + i + '" style="cursor:pointer;" title="' + allLibraries[i].sDirectory + '">' + allLibraries[i].sDirectory + '</a><span style="display:none">' + allLibraries[i].sDirectory + '</span>';
		tableRow("libraryTable", allLibraries[i].sVolumeName, c, "<input type='button' class='btn btn-danger' value='Remove' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode)'></input>");
	}

	$("#libraryTable").append("<tr id='addLibRow'><td colspan='4'><input type='button' value='Add a folder' onclick='addLibrary(PickFolder())' class='btn-wide'></input></td></tr>");
	
	UpdateDomLinks();
	
	$("#settings a").addClass("underline");
	
	$("#loadingProgress").removeClass("invisible");
	
}
