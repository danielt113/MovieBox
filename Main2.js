var checkedDirs = new Array();
var showCount = 0;
var sYearInfo = "";
var theQual;
var thisSeason, thisEpisode, thisShow;
var k = 0;
var doneCount = 1;
var remainCount = 1;
var startDir;
var disabledLibraries = 0;
var doneLibraries = 0;

function tableRow() {
    var rt = "<tr>";
	for (var i = 1; i < arguments.length; i++) {
		rt += "<td>" + arguments[i] + "</td>";
	}		
	rt += "</tr>";
	$("#" + arguments[0]).append(rt);
}


//function listFolders
	//build array of unique folders
	
//function listFiles
	//put files in list
	//when done
//function checkFiles
	//check x files at a time
	
var libraryDepth = 0;
var folderList = new Array();
var iFolder = 0;
var iLibrary = 0;
var maxDepth = 2;
var barWidth = 0;

//setLoadingProgress();

function listFolders(dir) {
	var f = objFSO.GetFolder(dir);
	var fol = new Enumerator(f.SubFolders);
	
	try{remainCount += f.SubFolders.Count;}
	catch(e) {}
	
	
	//document.title = Math.ceil(100*(doneCount/remainCount));
	//this doesn't quite work
	//tableRow("summaryTable2", "done", doneCount, "remain", remainCount, dir);
	
	fol.moveFirst(); //go to first subfolder
	asynchronize(); //begin async filling up folderList
	
	function asynchronize() {
		//tableRow("summaryTable2", "listFolders", String(fol.item())) 
		
		//Make sure encountered folder is not undefined
		if (typeof fol.item() !== "undefined") {
			
			//Make sure encountered folder isn't a library we already checked
			var isLibrary = false;
			for (var i=0; i<allLibraries.length; i++) {
				if (allLibraries[i].sDirectory == String(fol.item())) {
					isLibrary = true;
				}
			}
			if (!isLibrary) {
				var subFolderDepth = String(fol.item()).split("\\").length - libraryDepth;
				if (subFolderDepth <= maxDepth) {
					folderList.push(String(fol.item()));
					document.getElementById("divInitializeFolders").innerHTML = numberWithCommas(Number(document.getElementById("divInitializeFolders").innerHTML.replace(/,/g,"")) + 1);
					listFiles(folderList[folderList.length - 1]);
					
				}
			}
		}
		if (!fol.atEnd()) doneCount++;
		fol.moveNext()
		if ((!fol.atEnd()) && ((subFolderDepth) <= maxDepth)) {
			
			setTimeout(function() {
				asynchronize();
			}
			,1);
		}
		else {
			if ((subFolderDepth) > maxDepth) {
				try{doneCount += f.SubFolders.Count - 1;}
				catch(e) {}
			}
			//tableRow("summaryTable2", "listFolders", "DONE: " + dir) 
			iFolder++;
			if (typeof folderList[iFolder] !== "undefined") {
				//tableRow("summaryTable2", "listFolders", "Do: " + folderList[iFolder]) 
				document.getElementById("initSmall").innerHTML = folderList[iFolder];
				listFolders(folderList[iFolder]);
			}
			else  {
				tableRow("summaryTable2", "listFolders", "done", allLibraries[iLibrary].sDirectory, iFolder);
				iLibrary++;
				if (iLibrary < allLibraries.length) {
					doneLibraries++;
					nextLibrary();
				}
				else {
					setLoadingProgress(100);
					init2();
				}
			}
		}
	}
}

function nextLibrary() {
	//alert(allLibraries[iLibrary].sEnabled);
if ((!objFSO.FolderExists(allLibraries[iLibrary].sDirectory)) || (!allLibraries[iLibrary].sEnabled)) {
		//alert();
		iLibrary++;
		if (iLibrary < allLibraries.length)
			nextLibrary();
		else 
			init2();
		return;
	}
	folderList.push(allLibraries[iLibrary].sDirectory);
	libraryDepth = String(allLibraries[iLibrary].sDirectory).split("\\").length;
	maxDepth = allLibraries[iLibrary].sMaxDepth;
	setLoadingProgress(Math.ceil(100*(doneLibraries/(allLibraries.length - disabledLibraries))));
	document.getElementById("initSmall").innerHTML = allLibraries[iLibrary].sDirectory;
	listFiles(folderList[folderList.length - 1]);
	listFolders(allLibraries[iLibrary].sDirectory);
}

function listFiles(dir) {
	var f, fc, s, orig, name, iCount = 0, iFoundCount = 0, bypassQuickTest = false;
	
	f = objFSO.GetFolder(dir);
	fc = new Enumerator(f.files);
	
	var numFiles = 0;
	
	for (var i = 0; i < allLibraries.length; i++) {
		if (dir == allLibraries[i].sDirectory)
			bypassQuickTest = true;
	}
	
	try {numFiles = f.files.Count;} //Sometimes we get a permission denied error which means 0 files
	catch(e) {}
	
	s = "";
	
	//nextFile();
	//function nextFile() {
	for (fc.moveFirst(); !fc.atEnd(); fc.moveNext())	{
		iCount++;
		if ((iCount > 30) && (dir.indexOf("download") < 0) && (iFoundCount == 0) && !bypassQuickTest)
			break;
		document.getElementById("divInitializeFiles").innerHTML = numberWithCommas(Number(document.getElementById("divInitializeFiles").innerHTML.replace(/,/g,"")) + 1);
		s = fc.item();
		//if file is a movie file
		if (knownExtensions.indexOf('.' + /[^.]+$/.exec(s) + '.') > -1) {
			iFoundCount++;
			orig = /([^\\]+)$/.exec(s)[1].slice(0, -4);
			name = cleanFileName(orig);
			
			//tableRow("summaryTable2", "listFiles", "add file", allLibraries[iLibrary].sDirectory, orig, name);
			
			if ((orig.indexOf('720p') > -1) || (orig.indexOf('720i') > -1))
				theQual = 'is720p'; //is720p is actually the CSS class name (can't start with a number)
			else if ((orig.indexOf('1080p') > -1) || (orig.indexOf('1080i') > -1))
				theQual = 'is1080p';
			else
				theQual = "";
		//Movies
			if (thisSeason === null) {
				document.getElementById("divInitializeFound").innerHTML = Number(document.getElementById("divInitializeFound").innerHTML) + 1;
				allMovies.push(new Movie(orig, name, s, dir, name, "", sYearInfo, "", "", "", "", "", theQual, "", "", ""));
			//Create temp movie to show without boxart
				if ((typeof concatSavedFiles === "undefined") || (concatSavedFiles.indexOf(s) < 0)) {
					//if doesn't exist then save in xml but as a temporary movie (gets deleted once the real one is queried and saved)
					SaveMovie(allMovies[allMovies.length - 1], 1);
				}
			}
		//Shows
			else {
				document.getElementById("divInitializeFoundEpisodes").innerHTML = Number(document.getElementById("divInitializeFoundEpisodes").innerHTML) + 1;
			//Check if show exists
				var showIndex = 0;
				for (showIndex=0; showIndex<allShows.length; showIndex++) {
					//Check if season exists in the show
					if (allShows[showIndex].sTitle.toUpperCase() == thisShow.toUpperCase()) {
						//if it does then put this episode in it
						break;
					}
				}
				if (showIndex == allShows.length) {
					//Create the show
					allShows.push(new TVShow(thisShow, ""));
					allShows[showIndex].sEpisodes = []; //Initialise the object array
					//if doesn't exist then save in xml but as a temporary movie (gets deleted once the real one is queried and saved)
					document.getElementById("divInitializeFoundShows").innerHTML = Number(document.getElementById("divInitializeFoundShows").innerHTML) + 1;
				}
				showCount++;
				concatFoundEpisodes += s;
				allShows[showIndex].sEpisodes.push(new Episode(orig, thisShow, "", thisSeason, thisEpisode, s, dir, theQual));
			}
		}
	}
}

function getLibraries() {
	var e, d;
	e = new Enumerator(objFSO.Drives);
	for (; !e.atEnd(); e.moveNext()) {
		d = e.item();
		if ((d.DriveType == 1) && (d.IsReady)) {
			if ((d.VolumeName != "") && (d.VolumeName != "System Reserved")) {
				if (savesExist == 0) {
					allLibraries.push(new Library(d.DriveLetter + ":\\", 1, "", "",d.VolumeName, "removable", true));
					//saveFolder(allLibraries[allLibraries.length - 1]);
				}
				else {
					//find the volume name in allLibraries and give it a path
					var bFound = false;
					for (var i=0; i<allLibraries.length; i++) {
						if (allLibraries[i].sVolumeName == d.VolumeName) {
							allLibraries[i].sDirectory = d.DriveLetter + ":\\";
							bFound = true;
						}
					}
					//if saves do exist but this removable drive hasn't been found before
					if (!bFound) {
						allLibraries.push(new Library(d.DriveLetter + ":\\", 1, "", "",d.VolumeName, "removable", true));
						//saveFolder(allLibraries[allLibraries.length - 1]);
					}
				}
			}
		}
	}
	//Do not do if we have folders saved
	if (savesExist == 0) {
		for (var i=0; i<1; i++) {
			var a = objShell.SpecialFolders(knownSpecialFolders[i]);  
			if ((a != "")  && (a !== undefined)) {
				allLibraries.push(new Library(a, 1, "", "", knownSpecialFolders[i], "fixed", true));
				//saveFolder(allLibraries[allLibraries.length - 1]);
			}
			if (i == 1) {
				a = a.substring(0, a.lastIndexOf("\\"));
				var b = "" + a;
				b = b.substring(b.lastIndexOf("\\") + 1, b.length);
				allLibraries.push(new Library(a, 1, "", "", b, "fixed", true));
				//saveFolder(allLibraries[allLibraries.length - 1]);
			}
				
		}
		for (var i=0; i<knownRegistries.length; i++) {
			var a = objShell.RegRead(knownRegistries[i]); 
			if ((a != "")  && (a !== undefined)) {
				allLibraries.push(new Library(a, 1, "", "", "Downloads", "fixed", true));
				//saveFolder(allLibraries[allLibraries.length - 1]);
			}
		}
	}
}

function cleanFileName(orig) {
	var newName, savedName, foundSupplementaryInfo = [];
	newName = orig.replace(/x.264/gi, "");
	newName = newName.replace(/h.264/gi, "");
	newName = newName.replace(/\./gi, " ");
	newName = newName.replace(/_/gi, " ");
	newName = newName.replace(/-/gi, " ");
	newName = newName.replace(/&/gi, " and ");
	
	//Get text inside brackets
	newName.replace(/\[(.+?)\]/g, function($0, $1) { foundSupplementaryInfo.push($1) })
	newName.replace(/\((.+?)\)/g, function($0, $1) { foundSupplementaryInfo.push($1) })
	newName.replace(/\{(.+?)\}/g, function($0, $1) { foundSupplementaryInfo.push($1) })

	newName = newName.replace(/ *\([^)]*\) */g, " "); //remove brackets and text inside of it
	newName = newName.replace(/ *\[[^)]*\] */g, " ");
	newName = newName.replace(/ *\{[^)]*\} */g, " ");
	
	newName = newName.replace(/^\s+|\s+$/g, ""); //Remove trailing and leading whitespace, put things that replace text with spaces above this
	newName = newName.replace(/(^\s*)|(\s*$)/gi, ""); //This line and the next two are equivalent to the trim function
	newName = newName.replace(/[ ]{2,}/gi, " ");
	newName = newName.replace(/\n /, "\n");
	//newName = newName.replace(/[^`'!&%#$:,' A-Za-z0-9]+/g, ""); //Remove any non A-Za-z0-9, except `!'&%#$:
	newName = newName.replace(/720p/gi, "");
	newName = newName.replace(/720i/gi, "");
	newName = newName.replace(/1080i/gi, "");
	newName = newName.replace(/1080p/gi, "");
	newName = newName.replace(/240p/gi, "");
	newName = newName.replace(/480p/gi, "");
	newName = newName.replace(/240i/gi, "");
	newName = newName.replace(/480i/gi, "");
	newName = newName.replace(/yify/gi, "");
	newName = newName.replace(/x264/gi, "");
	newName = newName.replace(/h264/gi, "");
	newName = newName.replace(/bluray/gi, "");
	newName = newName.replace(/brray/gi, "");
	newName = newName.replace(/brrip/gi, "");
	newName = newName.replace(/xvid/gi, "");
	newName = newName.replace(/extratorrentrg/gi, "");
	newName = newName.replace(/dvdrip/gi, "");
	newName = newName.replace(/dd5/gi, "");
	newName = newName.replace(/BOKUTOX/gi, "");
	newName = newName.replace(/hdtv/gi, "");
	
	newName = cleanWhitespace(newName);
		
	savedName = newName; //save the name again before we try this next one

//Determine if this is a season/episode
	thisSeason = null; thisEpisode = null;
	thisSeason =  newName.match(/S\d{1,2}E\d{1,2}/gi);
	if (thisSeason !== null) { //If it is then extract the season/episode
		thisShow = cleanWhitespace(newName.match(/.+?(?=s\d{1,2}e\d{1,2})/gi)[0]).replace(/\w\S*/g, function(txt){return titleCase(txt)});
		thisShow = thisShow.replace(/^\S/g, function(txt){return txt.toUpperCase()});
		if (typeof knownShowAbbreviations[thisShow.toUpperCase()] !== "undefined")
			thisShow = knownShowAbbreviations[thisShow.toUpperCase()];
		
		newName = newName.replace(/S\d{1,2}E\d{1,2}/gi, "");
		thisEpisode = parseInt(thisSeason[0].match(/E\d{1,2}/gi)[0].substring(1));
		thisSeason = parseInt(thisSeason[0].match(/S\d{1,2}/gi)[0].substring(1));
	}
	
	if (newName.length > 4) { //Only if string is longer than 4 chars, remove digit blocks with pattern 19** and 20**
		//Save year info then remove the year
		foundSupplementaryInfo = foundSupplementaryInfo.concat(newName.match(/[2][0][0-9][0-9]/gi));
		foundSupplementaryInfo = foundSupplementaryInfo.concat(newName.match(/[1][9][0-9][0-9]/gi));
		newName = newName.replace(/[2][0][0-9][0-9]/gi, "");
		newName = newName.replace(/[1][9][0-9][0-9]/gi, "");
	}
	newName = encodeURI(newName);
//Remove space at end again in case
	if (newName.substring(newName.length - 3, newName.length) == "%20")
		newName = newName.substring(0, newName.length - 3);
	newName = decodeURI(newName);
	if (newName.length == 0) 
		newName = savedName;
//Check to see if the supplementary info is a date between 1900 and this year
	sYearInfo = "";
	for (var i = 0; i < foundSupplementaryInfo.length; i++) {
		if ((parseInt(foundSupplementaryInfo[i]) <= new Date().getFullYear()) && (parseInt(foundSupplementaryInfo[i]) > 1899))
			sYearInfo += foundSupplementaryInfo[i];
	}
	if (sYearInfo.length > 4) sYearInfo = "";
	
//Capitalize properly
	newName = newName.replace(/\w\S*/g, function(txt){return titleCase(txt)});
	newName = newName.replace(/^\S/g, function(txt){return txt.toUpperCase()});
	return newName;
}
function titleCase(txt){
	var dontCapitalize = ["a", "an", "the", "at", "by", "for", "in", "of", "on", "to", "up", "and", "as", "but", "or", "nor"];
	txt = txt.toLowerCase();
	if (dontCapitalize.indexOf(txt) > -1) 
		return txt;
	var romanNumeralsReg = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;
	if (romanNumeralsReg.test(txt))
		return txt.toUpperCase();
	return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
}
function cleanWhitespace(aPhrase) {
//Remove groups of spaces
	var theSavedName = aPhrase; //save the name before we try this next one
	aPhrase = encodeURI(aPhrase);
	aPhrase = aPhrase.replace(/%20%20%20%20%20%20%20/gi, "%20");
	aPhrase = aPhrase.replace(/%20%20%20%20%20%20/gi, "%20");
	aPhrase = aPhrase.replace(/%20%20%20%20%20/gi, "%20");
	aPhrase = aPhrase.replace(/%20%20%20%20/gi, "%20");
	aPhrase = aPhrase.replace(/%20%20%20/gi, "%20");
	aPhrase = aPhrase.replace(/%20%20/gi, "%20");
//Remove space at end
	if (aPhrase.substring(aPhrase.length - 3, aPhrase.length) == "%20")
		aPhrase = aPhrase.substring(0, aPhrase.length - 3);
//Remove space at beginning
	if (aPhrase.substring(0, 3) == "%20")
		aPhrase = aPhrase.substring(3, aPhrase.length);
	aPhrase = decodeURI(aPhrase);
	if (aPhrase.length == 0)
		aPhrase = theSavedName;
	return aPhrase;
	
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}