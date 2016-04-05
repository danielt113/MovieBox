var knownExtensions = ".3g2.3gp.3gp2.3gpp.amv.asf.drc.dv.f4v.flv.gxf.m1v.m2t.m2v.m2ts.m4v.mkv.mov.mp2.mp2v.mp4.mp4v.mpa.mpe.mpeg.mpeg1.mpeg2.mpeg4.mpg.mpv2.mts.mtv.mxf.nsv.nuv.ogg.ogm.ogx.ogv.rec.rm.rmvb.tod.ts.tts.vob.vro.webm.wmv.avi.divx.";
var knownSpecialFolders = ["Desktop", "MyDocuments", "MyVideos", "CommonVideos", "UserProfile"];
var knownRegistries = ["HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders\\{374DE290-123F-4565-9164-39C4925E467B}"];
var knownShowAbbreviations = {
	GOT : "Game of Thrones",
	HIMYM : "How I Met Your Mother",
	BMS : "Blue Mountain State",
	WLIIA : "Who's Line Is it Anyway?",
};

var objShell = new ActiveXObject("wscript.shell");
var objFSO = new ActiveXObject("Scripting.FileSystemObject");
var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
var objXSL = new ActiveXObject("Microsoft.XMLDOM");
var allMovies = [];
var allMovieQueries = [];
var allEpisodes = [];
var allShows = [];
var allLibraries = [];
var saveFile = "Movie-Data.xml";//objShell.SpecialFolders(knownSpecialFolders[1]) + '\\MovieBox\\Movie-Data.xml';
var saveFileFolder = objShell.SpecialFolders(knownSpecialFolders[1]) + '\\MovieBox';
var concatFoundFiles, concatSavedFiles, concatFoundEpisodes, concatSavedEpisodes, concatFoundShows, concatSavedShows, savesExist, loaded=0;

function Movie(sOriginal, sQuery, sFilePath, sDirectory, sTitle, sPoster, sYear, sRating, sVoteCount, sSynopsis, sRuntime, sRelease, sQuality, JSONGenreList, sBudget, sTrailer){
	this.sOriginal = sOriginal;
	this.sQuery = sQuery;
	this.sFilePath = sFilePath;
	this.sDirectory = sDirectory;
	this.sTitle = sTitle;
	this.sPoster = sPoster;
	this.sYear = sYear;
	this.sRating = sRating;
	this.sVoteCount = sVoteCount;
	this.sSynopsis = sSynopsis;
	this.sRuntime = sRuntime;
	this.sRelease = sRelease;
	this.sQuality = sQuality;
	this.JSONGenreList = JSONGenreList;
	this.sBudget = sBudget;
	this.sTrailer = sTrailer;
}
function TVShow(sTitle, sEpisodes, sPoster, sYear, sID) {
	this.sTitle = sTitle;
	this.sEpisodes = sEpisodes;
	this.sPoster = sPoster;
	this.sYear = sYear;
	this.sID = sID;
}
function Episode(sOriginal, sShow, sTitle, sSeason, sEpisode, sFilepath, sDirectory, sQuality, sOverview){
	this.sOriginal = sOriginal;
	this.sShow = sShow;
	this.sTitle = sTitle;
	this.sSeason = sSeason;
	this.sEpisode = sEpisode;
	this.sFilepath = sFilepath;
	this.sDirectory = sDirectory;
	this.sQuality = sQuality;
	this.sOverview = sOverview;
}
function Library(sDirectory, sMaxDepth, sChecked, sMovieCount, sVolumeName, sType, sEnabled) {
	this.sDirectory = sDirectory;
	this.sMaxDepth = sMaxDepth;
	this.sChecked = sChecked;
	this.sMovieCount = sMovieCount;
	this.sVolumeName = sVolumeName;
	this.sType = sType;
	this.sEnabled = sEnabled;
}

function selectSort(elem) {
	$('#divOptions').hide();
	$('#aInitializeConsole').hide();
	$('#divProblems').show();
	$('#divDialogue').html("");
	$('#summaryTable').show();
	$('#Boxart').show();
	$("#settings a").removeClass("underline");
	$("#sort > a").addClass("underline");
	setTimeout(function() {reSortBy(elem.innerHTML);}, 1);
	document.getElementById("cmSort").parentNode.removeChild(document.getElementById("cmSort"));
	var cmSort = document.createElement("small");
	cmSort.setAttribute("id","cmSort");
	cmSort.innerHTML = "&nbsp;&#10003;"; //this is a checkmark
	elem.parentNode.appendChild(cmSort);
}

function filterMovies(elem) {
	if (elem.value.length > 0) {
		$('#divOptions').hide();
		$('#aInitializeConsole').hide();
		$('#divProblems').show();
		$('#divDialogue').html("");
		$('#summaryTable').show();
		$('#Boxart').show();
		$("#menu li > a").removeClass("underline");
		$("#search label").addClass("underline");
		var ThisRow = xmlDoc.createElement("Search");
		xmlDoc.documentElement.appendChild(ThisRow);
		ThisRow.setAttribute("Text", elem.value);
		reSortBy("Search");
		xmlDoc.documentElement.removeChild(ThisRow);
	}
	else {
		$("#search label").removeClass("underline");
		$("#sort > a").addClass("underline");
		reSortBy(document.getElementById("cmSort").parentNode.childNodes[0].innerHTML);
	}
}

//"C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe" double back slashes and must be in it's own quotes!
function playMov(sPath) {
    try {objShell.Run('"' + htmlDecode($(sPath).next().html()) + '"');} //This one works (takes a second)
    catch (e) {alert("Windows could not initialize: " + '"' + htmlDecode($(sPath).next().html()) + '"');}
}
function playTrailer(sPath) {
	try {objShell.run(htmlDecode($(sPath).next().html()));}
	catch (e) {if ($(sPath).next().html() != "" ) alert("Windows could not open this link: " + htmlDecode($(sPath).next().html()));}
}
function exploreMov(sPath) {
    try {objShell.Run('Explorer /Select,' + htmlDecode($(sPath).next().html()) + '');} 
	catch (e) {alert("Windows could not find: " + '"' + htmlDecode($(sPath).next().html()) + '"');}
}
function expandShow(elem) {
	var a = elem.parentNode.parentNode.parentNode.getAttribute("class");
	if (a.indexOf("Expanded") > -1) {
		elem.parentNode.parentNode.parentNode.setAttribute("class", a.replace(" Expanded", ""));
		//document.getElementById($(elem).next().html()).parentNode.removeChild(document.getElementById($(elem).next().html()));
		$(".episodeSeasonDiv[name='" + $(elem).next().html() + "']").remove();
		elem.value = "Open";
	}
	else {
		elem.parentNode.parentNode.parentNode.setAttribute("class", a + " Expanded");
		var ThisRow = xmlDoc.createElement("ShowExpand");
		xmlDoc.documentElement.appendChild(ThisRow);
		ThisRow.setAttribute("Title", $(elem).next().html());
		//Capture transformed html
		objXSL.async = false;
		objXSL.load("ShowExpand.xsl");
		//$(xmlDoc.transformNode(objXSL)).insertAfter(elem.parentNode.parentNode.parentNode);
		$(".CoverArt[name='" + $(elem).next().html() + "']").append(xmlDoc.transformNode(objXSL));
		xmlDoc.documentElement.removeChild(ThisRow);
		elem.value = "Close";
	}
}

function resetMovieData() {
	if (confirm("This will clear your saved movie data. Are you sure you wish to continue?")) {
		objFSO.DeleteFile(saveFile);
		location.reload();
	}
}

function deleteMov(sPath) {
    try {
		if (confirm("Are you sure you wish to permanently delete: " + htmlDecode($(sPath).next().html()))) {
			objFSO.DeleteFile(htmlDecode($(sPath).next().html()));
			var allRows = xmlDoc.getElementsByTagName("Movie");
			for (var i = 0; i < allRows.length; i++) {
				if (allRows[i].getElementsByTagName("Filepath")[0].childNodes[0].nodeValue == htmlDecode($(sPath).next().html())) {
					allRows[i].parentNode.removeChild(allRows[i]);
					i = allRows.length;
					reSortBy(document.getElementById("cmSort").parentNode.childNodes[0].innerHTML);
				}
			}
		}
	}catch (e) {alert("Windows could not delete: " + '"' + unescape(sPath.childNodes[0].innerHTML) + '"');}
}
function htmlDecode(input){
	var b, e = document.createElement('div');
	e.innerHTML = input;
	b = e.childNodes[0].nodeValue;
	e.innerHTML = "";
	e = null;
	return b
}

function setLoadingProgress(percent){
	if (percent > 100)
		return;
    var loadBar = document.getElementById("loadingProgress");
    loadBar.style.width = percent+"%";
}

function chkChange(me) {
	if (me.checked)
		$("#" + me.id).next().text(" (Yes)")
	else
		$("#" + me.id).next().text(" (No)")
	//me.parentNode.innerHTML = me.parentNode.innerHTML.replace("Yes", "No");
}

function searchForMovies(skipSaving) {
	$('#divOptions').hide();
	$('#searchBoxLabel').removeClass('not-allowed');
	$('#searchBox').removeClass('not-allowed');
	$('#searchBox').prop('disabled', false);
	$('#divDialogue').html('Searching...');
	$('#Boxart').show();
	
	$('ul#menu li:first-child').prop('disabled', false);
	$('ul#menu li:first-child a').removeClass('not-allowed');
	$('ul#menu li:first-child div').removeClass('not-allowed');
	$('ul#menu #search').prop('disabled', false);
	
	$("#settings a").removeClass("underline");
	$("#sort > a").addClass("underline");
	
	$('#summaryTable').show();
	
	if (!skipSaving) {
		deleteSavedFolders();
		for (var i=0; i<allLibraries.length; i++) {
			if ($("#chk" + i).length == 0) {
				allLibraries[i].sEnabled = false;
				disabledLibraries++;
			}
			else {
				allLibraries[i].sEnabled = document.getElementById("chk" + i).checked;
				if (!allLibraries[i].sEnabled)
					disabledLibraries++;
				saveFolder(allLibraries[i]);
			}
		}
		
		setOption("ask-on-startup", $("#askEveryTime").prop("checked"));
		
		xmlDoc.save(saveFile);
	}
	
	nextLibrary();
}

function openSettings() {
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
	
	loadXMLDoc();
	
	savesExist = retrieveSavedFolders();
	
	retrieveSavedFilePaths();

	getLibraries();
		
	$("#divOptions").show();
	document.getElementById("divDialogue").innerHTML = "Settings";
	$("#settings a").addClass("underline");
	
	$("#summaryTable2").hide();
	$("#loadingProgress").removeClass("invisible");

	document.getElementById("aInitializeConsole").style.display = "block";
	document.getElementById("divProblems").style.display="none";

	$("#settings a").addClass("underline");
	$("#sort > a").removeClass("underline");
	
	$('#divOptions').show();
	$('#Boxart').hide();
	
	$('#summaryTable').hide();
	//$('#loadingProgress').hide();
}

$(document).ready(function () {setTimeout(initializeMe, 100);});
/*try{*/
/* 
To do list:
to fix button clicks: execute dummy function OR http://eloquentjavascript.net/14_event.html
maintain expandShow when querying
push user profile folder to end of folder qeries
Avoid a list of folders (recycle bins and windows folder)
Show inactive for removable storage table items that are not plugged in (with no path)
Keep removable storage movies in moviedatabase
Change depth count to mean "all subfolders"
move databases to application data folder

Modify youtube URL:
Remove "watch?" and "=", add a "/".
Take for example this red band trailer for nightcrawler.
From:
http://www.youtube.com/watch?v=GRdHmB-EH9o 
to:
http://www.youtube.com/v/GRdHmB-EH9o
 */	

//Load the save file otherwise create a blank one
function addLibrary(dirF) {
	//determine if it's a removable harddrive
	//(sDirectory, sMaxDepth, sChecked, sMovieCount, sVolumeName, sType, sEnabled)
	if (typeof dirF === "undefined")
		return;
	var b = dirF;
	b = b.substring(b.lastIndexOf("\\") + 1, b.length);
	allLibraries.push(new Library(dirF, 2, "", "", b, "fixed", true))
	$("#addLibRow").before(
		"<tr><td>" + allLibraries[allLibraries.length - 1].sVolumeName + "</td><td>" +
		'<a style="cursor:pointer;" title="' + dirF + '" onclick="exploreMov(' + "this" + ');"><b style="display:none;">' + dirF + '</b>' + dirF + "</a></td><td>" +
		"<label class='muted' for='chk" + (allLibraries.length - 1) + "'><input id='chk" + (allLibraries.length - 1) + "' type='checkbox' checked onchange='chkChange(this)'></input><small> (Yes)</small></label></td><td>" +
		"<input type='button' class='btn btn-danger' value='Delete' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode)'></input></td>" +
		"</tr>"
	);
}
function initializeMe() {
	loadXMLDoc();

//Load any saved libraries to allLibraries
	savesExist = retrieveSavedFolders();
	
//Get list of filepaths that we already have saved in xml
	retrieveSavedFilePaths();

//Find any removable media and locate volume names to paths
	getLibraries();
	
	var skipSettings = -getOption("ask-on-startup",false);
	$("#askEveryTime").prop("checked", skipSettings);
	
	$("#summaryTable").hide();
	$("#summaryTableCaption").hide();
	
	for (var i=0; i<allLibraries.length; i++) {
		var b = "<label class='muted' for='chk" + i + "'><input id='chk" + i + "' type='checkbox' " + ((allLibraries[i].sEnabled==1)?"checked":"") + " onchange='chkChange(this)'></input><small> (" + ((allLibraries[i].sEnabled)?"Yes":"No") + ")</small></label>"
		var c = '<a style="cursor:pointer;" title="' + allLibraries[i].sDirectory + '" onclick="exploreMov(' + "this" + ');"><b style="display:none;">' + allLibraries[i].sDirectory + '</b>' + allLibraries[i].sDirectory;
		tableRow("libraryTable", allLibraries[i].sVolumeName, c, b, "<input type='button' class='btn btn-danger' value='Delete' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode)'></input>");
	}

	$("#libraryTable").append("<tr id='addLibRow'><td colspan='4'><input type='button' value='Add a folder' onclick='addLibrary(PickFolder())' class='btn-wide'></input></td></tr>");

	if (skipSettings == 1) {
		searchForMovies(skipSettings);
	}
	else {
		openSettings();
	}
}

function init2() {
	//return;
	$("#summaryTable2").hide();
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
	document.getElementById("initSmall").innerHTML = "";
	document.getElementById("divDialogue").innerHTML = "Getting box art";
	reSortBy(document.getElementById("cmSort").parentNode.childNodes[0].innerHTML);
	document.getElementById('summaryTableDestination').appendChild(document.getElementById('summaryTable'));
	
	//setTimeout(function () {document.getElementById("aInitializeConsole").style.display = "none";},4000);
	//document.getElementById("aInitializeConsole").style.display = "none";
	
	
//Start querying
	getQueryList();
	
//Start querying
	getMovieData(0);
	
//Code beyond getMovieData will be executed synchronously, asynchronous code must be put in continueMe()
	
/*} catch (e) {
	alert(e.message + ", in 1: " + thisIndex);
	closeMe();
}*/
	
}

function continueMe() {
	document.getElementById("aInitializeConsole").style.display = "none";
	document.getElementById("divProblems").style.display="block";
	xmlDoc.save(saveFile);
	document.getElementsByTagName("title")[0].innerHTML = "MovieBox";
	if (document.getElementById("searchBox").value.length == 0)
		reSortBy(document.getElementById("cmSort").parentNode.childNodes[0].innerHTML);
	//try{alert(document.getElementById("Frank").innerHTML);}catch(e){alert(e.message);}
	//setTimeout(function() {document.getElementById("btnAbout").click();}, 1000);
}
function reSortBy(sortMethod) {
	objXSL.async = false;
    objXSL.load(sortMethod + ".xsl");
    try {
		/*if ((pCount) && (sortMethod != "Search") && (sortMethod != "Libraries")) //this is here so we can show or not show problem list
			document.getElementById("divProblems").style.display="block";
        else 
			document.getElementById("divProblems").style.display="none";*/
		document.getElementById("Boxart").innerHTML = xmlDoc.transformNode(objXSL);
    } catch (Err) {
        document.getElementById("Boxart").innerHTML = Err.Description;
    }
}

function closeMe() {
	objShell = null;
	objFSO = null;
	xmlDoc = null;
	window.close();
}