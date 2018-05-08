function UpdateDomLinks() {
		
	//remove the class to make sure we don't init it twice
	$(".http-link").each(function(){
		var t = $(this)
		t.removeClass("http-link")
		t.addClass("http-link-inited")
		
		//add the click function
		t.on('click', function() {
			try {objShell.run(htmlDecode(t.attr("title")));}
			catch (e) {if (htmlDecode(t.attr("title")) != "" ) alert("Windows could not open this link: " + htmlDecode(t.attr("title")));}
			return false;
		});
			
	});
		
	$(".file-link").each(function(){
		var t = $(this)
		t.removeClass("file-link");
		t.addClass("file-link-inited");
		t.on('click', function() {
			try {objShell.Run('Explorer /Select,' +  (htmlDecode(t.attr("title"))) + '');} 
			catch (e) {alert("Windows could not find: " + '"' + htmlDecode(t.data("filepath")) + '"');}
			return false;
		});
	});


	$(".folder-link").each(function(){
		var t = $(this)
		t.removeClass("folder-link");
		t.addClass("folder-link-inited");
		t.on('click', function() {
			try {objShell.Run('Explorer ' + htmlDecode(t.next().html()) + '');} 
			catch (e) {alert("Windows could not find: " + '"' + htmlDecode(t.next().html()) + '"');}
			return false;
		});
	});
}

function selectEpisode(t) {
	var ESDiv = $(t).parent().parent();
	var s = ESDiv.find("select[season-selector]")[0];
	var season = s.options[s.selectedIndex].value;
	var episode = t.options[t.selectedIndex].value;
	var episodeTitle = $(t.options[t.selectedIndex]).data("title");
	var filepath = $(t.options[t.selectedIndex]).data("filepath");
	
	var h4text;
	if (episodeTitle)
		h4text = "<small class=''>" + season + "." + episode + "</small> " + episodeTitle;
	else
		h4text = "Season " + season + " Episode " + episode;
	
	ESDiv.find("h4").html(h4text);
	
	//set all button data to this episode
	ESDiv.find("input[type=button][data-filepath]").each(function(){
		$(this).data("filepath", filepath)
	});
	ESDiv.find("input[type=button][title]").each(function(){
		$(this).attr("title", filepath);
	});
}

function selectSeason(t) {
	var season = t.options[t.selectedIndex].value;
	var ESDiv = $(t).parent().parent();
	var episodeSelector = ESDiv.find("select[data-season=" + season + "]")[0];
	ESDiv.find("select[data-season]").each(function(){
		$(this).hide();
	});
	episodeSelector.style.display = "inline-block";
	selectEpisode(episodeSelector);
	
}

function selectSort(elem) {
	
	//setTimeout(function() {reSortBy(elem.innerHTML);}, 1);
	document.getElementById("cmSort").parentNode.removeChild(document.getElementById("cmSort"));
	var cmSort = document.createElement("small");
	cmSort.setAttribute("id","cmSort");
	cmSort.innerHTML = "&nbsp;&#10003;"; //this is a checkmark
	elem.parentNode.appendChild(cmSort);
	
	pages[elem.innerHTML.toLowerCase()].navigateTo();
}

function filterMovies(elem) {
	if (elem.value.length > 0) {
		var ThisRow = xmlDoc.createElement("Search");
		xmlDoc.documentElement.appendChild(ThisRow);
		ThisRow.setAttribute("Text", elem.value);
		
		//avoid running the whole navigation script
		if (pages.current.name == "Search")
			reSortBy("Search");
		else
			pages.search.navigateTo();
		
		xmlDoc.documentElement.removeChild(ThisRow);
	}
	else {
		pages[document.getElementById("cmSort").parentNode.childNodes[0].innerHTML.toLowerCase()].navigateTo();
		//reSortBy();
	}
}

$.expr[':'].textEquals = $.expr.createPseudo(function(arg) {
    return function( elem ) {
		//escape the arg string for the regex
        return $(elem).text().match("^" + arg.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$");
    };
});

function episodeExists(fpath) {
	//return ($(xmlDoc).find('Show Episode Filepath:textEquals("' + fpath.replace(/\\/gm,"\\") + '")').parent().length !== 0);
	
	
	var thisRow = xmlDoc.createElement("Search");
	thisRow.setAttribute("String",fpath);
	xmlDoc.documentElement.appendChild(thisRow);
	xmlDoc.setProperty("SelectionLanguage", "XPath");
	var b = xmlDoc.selectSingleNode("/Movies/Show/Episode[Filepath=../../Search/@String]");
	xmlDoc.documentElement.removeChild(thisRow);

	return (b != null);
}


function getEpisode(fpath) {
	var thisRow = xmlDoc.createElement("Search");
	thisRow.setAttribute("String",fpath);
	xmlDoc.documentElement.appendChild(thisRow);
	xmlDoc.setProperty("SelectionLanguage", "XPath");
	var b = xmlDoc.selectSingleNode("/Movies/Show/Episode[Filepath=../../Search/@String]");
	xmlDoc.documentElement.removeChild(thisRow);

	return b;
	//return $(xmlDoc).find('Show Episode Filepath:textEquals("' + fpath.replace(/\\/gm,"\\") + '")').parent();
}

function getMovie(fpath) {
	var thisRow = xmlDoc.createElement("Search");
	thisRow.setAttribute("String",fpath);
	xmlDoc.documentElement.appendChild(thisRow);
	xmlDoc.setProperty("SelectionLanguage", "XPath");
	var b = xmlDoc.selectSingleNode("/Movies/Movie[Filepath=../Search/@String]");
	xmlDoc.documentElement.removeChild(thisRow);

	return b;
	//return $(xmlDoc).find('Show Episode Filepath:textEquals("' + fpath.replace(/\\/gm,"\\") + '")').parent();
}

function getShowID(fpath) {
	var thisRow = xmlDoc.createElement("Search");
	thisRow.setAttribute("String",fpath);
	xmlDoc.documentElement.appendChild(thisRow);
	xmlDoc.setProperty("SelectionLanguage", "XPath");
	var b = xmlDoc.selectSingleNode("/Movies/Show/Title[.=../../Search/@String]/../ID");
	xmlDoc.documentElement.removeChild(thisRow);

	//tableRow("summaryTable2",fpath,$(b).text());
	
	if ((b == null) || (b.length == 0))
		return null;
	else 
		return $(b).text();
	//return $(xmlDoc).find('Show Episode Filepath:textEquals("' + fpath.replace(/\\/gm,"\\") + '")').parent();
}

//"C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe" double back slashes and must be in it's own quotes!
function playMov(sPath) {
    try {
		objShell.Run('"' + htmlDecode($(sPath).data("filepath")) + '"');
	}
    catch (e) {alert("Windows could not initialize: " + '"' + htmlDecode($(sPath).data("filepath")) + '"');}

		//check if TV show
		var b = $(sPath).parent().parent().parent();
		if (b.hasClass("episodeSeasonDiv")) {

			//get reference to episode in database
			var thisFile = getEpisode($(sPath).data("filepath"));

			//now reference to other episodes to remove the reference
			var prevEpisode = $(xmlDoc).find('Show Title:textEquals("' + b.attr("name") + '")').parent().find('Episode[LastWatched]');
			
			//remove it from the episode that already had it
			if (prevEpisode.length !== 0)
				prevEpisode.removeAttr("LastWatched");
			
		}
		else {
			//this is a movie
			//get reference to movie in database
			var thisFile = getMovie($(sPath).data("filepath"));
			
			//tableRow("summaryTable2", $(thisFile).text() );
		}
		
		//get primitive date (for sorting)
		var d = new Date();
		d = d.valueOf();
		
		//put attribute on episode to mark this episode as the last watched
		$(thisFile).attr("LastWatched", d);
		
		//save changes
		xmlDoc.save(saveFile);
			
		if (b.hasClass("episodeSeasonDiv")) {
			//get handle to the figure (where onclick is normally initiated) so we can re exapand the show
			var a = $(b).parent();
			var xslExpandName = "ShowExpand";
			
			//remove the expanded portion
			$(a).children(".episodeSeasonDiv").remove();
			
			var ThisRow = xmlDoc.createElement(xslExpandName);
			xmlDoc.documentElement.appendChild(ThisRow);
			
			ThisRow.setAttribute("Title", $(a).attr("name"));
			
			//Capture transformed html
			objXSL.async = false;
			objXSL.load(xslFolder + xslExpandName + ".xsl");

			$(a).append(xmlDoc.transformNode(objXSL));
			xmlDoc.documentElement.removeChild(ThisRow);
		}
}
function playTrailer(sPath) {
	try {objShell.run(htmlDecode($(sPath).attr("title")));}
	catch (e) {if (htmlDecode($(sPath).attr("title")) != "" ) alert("Windows could not open this link: " + htmlDecode($(sPath).attr("title")));}
}

//for files
function exploreMov(sPath) {
    try {objShell.Run('Explorer /Select,' +  ($(sPath).data("filepath")) + '');} 
	catch (e) {alert("Windows could not find: " + '"' + htmlDecode($(sPath).data("filepath")) + '"');}
}

//for folders
function exploreMov2(sPath) {
    try {objShell.Run('Explorer ' + htmlDecode($(sPath).next().html()) + '');} 
	catch (e) {alert("Windows could not find: " + '"' + htmlDecode($(sPath).next().html()) + '"');}
}

function expandDetails(elem) {
	//most outer Div (class = coverArt)
	var a = elem.parentNode;
	var xslExpandName = ($(a).hasClass("Movie"))?"MovieExpand":"ShowExpand";
	if (a.getAttribute("class").indexOf("Expanded") > -1) {
		a.setAttribute("class", a.getAttribute("class").replace(" Expanded", ""));
		//document.getElementById($(elem).next().html()).parentNode.removeChild(document.getElementById($(elem).next().html()));
		$(a).children(".episodeSeasonDiv").remove();
	}
	else {
		a.setAttribute("class", a.getAttribute("class") + " Expanded");
		var ThisRow = xmlDoc.createElement(xslExpandName);
		xmlDoc.documentElement.appendChild(ThisRow);
		
		//movie details are given by filepath
		if (xslExpandName == "MovieExpand")
			ThisRow.setAttribute("Filepath", $(a).data("filepath"));
		
		//show details are given by name of show
		if (xslExpandName == "ShowExpand")
			ThisRow.setAttribute("Title", $(a).attr("name"));
		
		//alert(ThisRow.getAttribute("Title"));
		
		//Capture transformed html
		objXSL.async = false;
		objXSL.load(xslFolder + xslExpandName + ".xsl");
		//$(xmlDoc.transformNode(objXSL)).insertAfter(elem.parentNode.parentNode.parentNode);
		$(a).append(xmlDoc.transformNode(objXSL));
		xmlDoc.documentElement.removeChild(ThisRow);
		
		if (xslExpandName == "ShowExpand")
			selectSeason($(a).find("select[season-selector]")[0]);
	}
}

function resetMovieData() {
	if (confirm("This will clear settings and movie information. Are you sure you wish to continue?")) {
		objFSO.DeleteFile(saveFile);
		location.reload();
	}
}

function dismissMov(sPath) {

	//get handle to xml row
	var m = getMovie($(sPath).data("filepath"));
	
	//delete the lastwatched attribute
	m.removeAttribute("LastWatched");
	
	//save changes
	xmlDoc.save(saveFile);
	
	//resort to makes it's removed from box art continue watching section
	reSortBy(document.getElementById("cmSort").parentNode.childNodes[0].innerHTML);
}

function deleteMov(sPath) {
    try {
		if (confirm("Are you sure you wish to permanently delete: " + htmlDecode($(sPath).attr("title")))) {
			objFSO.DeleteFile(htmlDecode($(sPath).attr("title")));
			var allRows = xmlDoc.getElementsByTagName("Movie");
			for (var i = 0; i < allRows.length; i++) {
				if (allRows[i].getElementsByTagName("Filepath")[0].childNodes[0].nodeValue == htmlDecode($(sPath).attr("title"))) {
					allRows[i].parentNode.removeChild(allRows[i]);
					i = allRows.length;
					reSortBy(document.getElementById("cmSort").parentNode.childNodes[0].innerHTML);
				}
			}
		}
	}catch (e) {alert("Windows could not delete: " + '"' + unescape(sPath.childNodes[0].innerHTML) + '"');}
}

function renameFiles() {
	$("#renameTable tr a.file-link-inited").each(function() {
		
		var s = this.getAttribute("title");
		var origFile = s;
		var filePath = s.substring(0, s.lastIndexOf("\\") + 1);
		var fileExt = s.substring(s.lastIndexOf("."), s.length);
		var userTitle = $(this.parentNode.parentNode).find("input[type=text]").val().replace(/[\~\#\%\&\*\{\}\\\:\<\>\?\/\+\|]/gm,"");
		var identifiedTitle = $(this.parentNode.parentNode).find("span a").text().replace(/[\~\#\%\&\*\{\}\\\:\<\>\?\/\+\|]/gm,"");
		
		if ((s.length === 0) || (filePath.length === 0) || (fileExt.length === 0) || (userTitle.length === 0) || (identifiedTitle.length === 0) || (identifiedTitle == noMatchText))
			return true; //skip to next iteration by returning true
		
		var t;
		
		//check which title to use
		if ($("#useTitleIdentified").is(":checked"))
			objFSO.MoveFile(origFile, filePath + identifiedTitle + fileExt);
		else
			objFSO.MoveFile(origFile, filePath + userTitle + fileExt);
		
		//refresh immediately to get the new files in the database
		location.reload();
	});
}

/*
function chkChange(me) {
	if (me.checked)
		$("#" + me.id).next().text(" (Yes)")
	else
		$("#" + me.id).next().text(" (No)")
	//me.parentNode.innerHTML = me.parentNode.innerHTML.replace("Yes", "No");
}
*/

function tableRow() {
	//the first argument must be the ID of the destination table
    var rt = "<tr>";
	for (var i = 1; i < arguments.length; i++) {
		rt += "<td>" + arguments[i] + "</td>";
	}		
	rt += "</tr>";
	$("#" + arguments[0]).append(rt);
}

function clearTable(id) {
	$("#" + id).find("tr:gt(0)").remove();
}

function searchForMovies(skipSaving) {

	if (!skipSaving) {
		deleteSavedFolders();
		for (var i=0; i<allLibraries.length; i++) {
			if ($("#chk" + i).length == 0) {
				allLibraries[i].sEnabled = false;
				disabledLibraries++;
			}
			else {
				//allLibraries[i].sEnabled = document.getElementById("chk" + i).checked;
				//if (!allLibraries[i].sEnabled)
				allLibraries[i].sEnabled = true;
				saveFolder(allLibraries[i]);
			}
		}
		
		setOption("ask-on-startup", $("#askEveryTime").prop("checked"));
		setOption("debug-mode", $("#debugModeCheck").prop("checked"));
		
		xmlDoc.save(saveFile);
	}
	
	pages.searching.navigateTo();
	
	nextLibrary();
}

function htmlDecode(input){
	if (input == "") 
		return "";
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
		'<a id="chk' + (allLibraries.length - 1) + '" style="cursor:pointer;" title="' + dirF + '" onclick="exploreMov(' + "this" + ');"><b style="display:none;">' + dirF + '</b>' + dirF + "</a></td>" + /*<td>" +
		"<label class='muted' for='chk" + (allLibraries.length - 1) + "'><input id='chk" + (allLibraries.length - 1) + "' type='checkbox' checked onchange='chkChange(this)'></input><small> (Yes)</small></label></td>*/"<td>" +
		"<input type='button' class='btn btn-danger' value='Remove' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode)'></input></td>" +
		"</tr>"
	);
}

function reSortBy(sortMethod) {
	objXSL.async = false;
	
	if (sortMethod != "Search") {
		//load and transform Continue watching
		objXSL.load(xslFolder + "ContinueWatching.xsl");
		try {
			document.getElementById("Boxart").innerHTML = xmlDoc.transformNode(objXSL);
		} catch (Err) {
			document.getElementById("Boxart").innerHTML = "<p style='color:red;'><b>Error:</b> The " + xslFolder + " ContinueWatching.xsl transformation encountered the following error: " + Err.Description + "</p>";
		}
	}
	else
		document.getElementById("Boxart").innerHTML = "";
	
	//load and transform the selected transformation
	objXSL.load(xslFolder + sortMethod + ".xsl");
    try {
		document.getElementById("Boxart").innerHTML += xmlDoc.transformNode(objXSL);
    } catch (Err) {
        document.getElementById("Boxart").innerHTML += "<p style='color:red;'><b>Error:</b> The " + xslFolder + sortMethod + ".xsl" + " transformation encountered the following error: " + Err.Description + "</p>";
    }
	
	if ($(".CoverArt").length)
		$("#tmdbAttribution").show();
	else
		$("#tmdbAttribution").hide();
}

function handleKeyPress(t, e) {
	if (!e) 
		var e = window.event;

	// Enter is pressed
	if (e.keyCode == 13)
		$(t.parentNode).find("input[type=button]").first().click();
}