var objShell = new ActiveXObject("wscript.shell");
var objFSO = new ActiveXObject("Scripting.FileSystemObject");
var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
var objXSL = new ActiveXObject("Microsoft.XMLDOM");

var allMovies = [];
var allMovieQueries = [];
var allEpisodes = [];
var allShows = [];
var allShowQueries = [];
var allLibraries = [];

var concatFoundFiles = '', concatSavedFiles = '', concatFoundEpisodes = ''; 
var concatSavedEpisodes = '', concatFoundShows = '', concatSavedShows = ''; 
var savesExist, loaded=0;

function Movie(sOriginal, sQuery, sFilePath, sDirectory, sTitle, sPoster, sYear, sRating, sVoteCount, sSynopsis, sRuntime, sRelease, sQuality, JSONGenreList, sBudget, sTrailer, sTagline){
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
	this.sTagline = sTagline;
}
function TVShow(sTitle, sSeasons, sPoster, sYear, sID, sEpisodes) {
	this.sTitle = sTitle;
	this.sSeasons = sSeasons;
	this.sPoster = sPoster;
	this.sYear = sYear;
	this.sID = sID;
	this.sEpisodes = sEpisodes;
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
function Season(sNumber, sEpisodeCount, sEpisodes){
	this.sNumber = sNumber;
	this.sEpisodeCount = sEpisodeCount;
	this.sEpisodes = sEpisodes;
	
}
function Library(sDirectory, sMaxDepth, sChecked, sMovieCount, sVolumeName, sType, sEnabled, sFiles, sFolders, sMovies, sShows, sEpisodes) {
	this.sDirectory = sDirectory;
	this.sMaxDepth = sMaxDepth;
	this.sChecked = sChecked;
	this.sMovieCount = sMovieCount;
	this.sVolumeName = sVolumeName;
	this.sType = sType;
	this.sEnabled = sEnabled;
	this.sFiles = sFiles;
	this.sFolders = sFolders;
	this.sMovies = sMovies;
	this.sShows = sShows;
	this.sEpisodes = sEpisodes;
}