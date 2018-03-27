var results1;
var removeLastWords = 0;
var pCount = 0;
var url;
var errOrigin;
var thisIndex = 0;
var seasonQueryCount = 0;
var showQueryCount = 0;

function getQueryList() {
	if (concatSavedFiles.length == 0) {
		allMovieQueries = allMovies;
	}
	else {
		//Get a list of only movies that are not already saved
		for (var i = 0; i < allMovies.length; i++)
			if (concatSavedFiles.indexOf(allMovies[i].sFilePath) < 0)
				allMovieQueries.push(allMovies[i]);
	}

	//check all shows
	for (var i = 0; i < allShows.length; i++) {
		
			//Check if this show has an ID (must check xml database)
			allShows[i].sID = getShowID(allShows[i].sTitle);
		
			//add a deep copy of the show here. Deep copy because we will be deleting from this copy
			allShowQueries.push(jQuery.extend(true, {}, allShows[i]));
			
			if ((allShows[i].sID == null) || (allShows[i].sID.length == 0)) {
				tableRow("summaryTable2", "show does not exist", allShows[i].sTitle);
				//if no id, the show is completely new, so we add all it's episodes + 1 (for show id)
				showQueryCount += allShows[i].sSeasons.length + 1;
			}
			else {
				//check if there are new episodes
				var hasNewEpisodes = false;
				
				//clear seasons array
				allShowQueries[allShowQueries.length - 1].sSeasons = [];
				
				for (var e = 0; e < allShows[i].sEpisodes.length; e++) {
					
					//get this episode if it exists from xml
					var XMLEpisode = getEpisode(allShows[i].sEpisodes[e].sFilepath);
					
					//if it doesn't exist, make sure we add this season
					if (XMLEpisode == null) {
						//tableRow("summaryTable2", allShows[i].sTitle, "does not have", allShows[i].sEpisodes[e].sSeason, allShows[i].sEpisodes[e].sEpisode);
						//this makes sure we don't delete this show from queries
						hasNewEpisodes = true;
						
						//add this season to the season list
						if (allShowQueries[allShowQueries.length - 1].sSeasons.indexOf(allShows[i].sEpisodes[e].sSeason) < 0) {
							
							//add a new unique season
							seasonQueryCount++;
							allShowQueries[allShowQueries.length - 1].sSeasons.push(allShows[i].sEpisodes[e].sSeason);
						}
					}
					else {
						//tableRow("summaryTable2", allShows[i].sTitle, "HAS", allShows[i].sEpisodes[e].sSeason, allShows[i].sEpisodes[e].sEpisode);
						//remove this episode since it exists
						//delete allShowQueries[allShowQueries.length - 1].sEpisodes[e] - use splice since delete only sets the element to undefined, splice removes the element from the object
						allShowQueries[allShowQueries.length - 1].sEpisodes.splice(e, 1);
					}
				}
				
				//if there were no episodes to query, remove the show
				if (!hasNewEpisodes) {
					allShowQueries.pop();
					//tableRow("summaryTable2", "removed whole show", allShows[i].sTitle);
				}
			}
		}
	thisIndex = 0;
	return;
}

	

function getMovieData() {
	
	//Update title to show progress
	document.getElementsByTagName("title")[0].innerHTML = "MovieBox is working... (" + (thisIndex) + " of " + (allMovieQueries.length + seasonQueryCount + showQueryCount) + ")";
	
	//if (pCount) document.getElementById("divProblems").style.display="block";
	if (thisIndex < allMovieQueries.length)
			queryTMDb(thisIndex);
	else
		getShowData();
	//No code should be placed here
}

function modifyQuery(strQuery) {
	if (removeLastWords == 0) 
		return strQuery;
	var a, saveStrQuery = strQuery;
	for (var i = 0; i < removeLastWords; i++) {
		a = strQuery.lastIndexOf(" ");//(strQuery.lastIndexOf(" ") < strQuery.lastIndexOf("\s")) ? strQuery.lastIndexOf("\s") : strQuery.lastIndexOf(" ");
		strQuery = strQuery.substring(0, a);
	}
	if ((saveStrQuery == strQuery) || (strQuery == "") || (strQuery == " ")) {
		errOrigin = "No results";
		handleQueryError();
		return "";
	}
	//if (strQuery.indexOf("Half") > -1)
	//	alert("was: '" + encodeURI(saveStrQuery) + "' is now: '" + strQuery + "' removed: " + removeLastWords + " words");
	return strQuery;
}

function queryTMDb(index) {
	var a = encodeURI(modifyQuery(allMovieQueries[thisIndex].sQuery));
	if (a == "")
			return;
	var b = ((allMovieQueries[thisIndex].hasOwnProperty("sYear")) && (allMovieQueries[thisIndex].sYear != "")) ? ("&year=" + allMovieQueries[thisIndex].sYear) : "";
	$.support.cors = true;
	//tableRow("summaryTable2", "https://api.themoviedb.org/3/search/movie?query=" + a + b + "&api_key=" + apikey);
	setTimeout(function(){
		$.ajax({
			url: "https://api.themoviedb.org/3/search/movie?query=" + a + b + "&api_key=" + apikey,
			success: parseIDMatchResults/*parseNameMatchResults*/,
			async: false,
			type: 'GET',
			//contentType: 'application/json',
			dataType: 'json',
			beforeSend: function (jqXHR, settings) {
				url = settings.url;
			},
			error: function (jqXHR, textStatus, errorThrown) {errOrigin = "queryTMDB"; handleQueryError(jqXHR, textStatus, errorThrown); }
		});
	}, 300);
}

function parseNameMatchResults(json) {
	var bestGuess = 0;
	if (json.total_results > 0) {
		//tableRow("problemTable", "https://api.themoviedb.org/3/movie/" + json.results[bestGuess].id + "?&api_key=" + apikey + "&append_to_response=trailers");
		removeLastWords = 0;
		results1 = json.results[bestGuess];
		setTimeout(function(){
			$.ajax({ //This is here because we need to query for the actual movie url from the ID from the search allMovieQueries[thisIndex].sQuery, this returns genres, and trailer
				url: "https://api.themoviedb.org/3/movie/" + json.results[bestGuess].id + "?&api_key=" + apikey + "&append_to_response=trailers",
				success: parseIDMatchResults,
				async: false,
				type: 'GET',
				contentType: 'application/json',
				dataType: 'json',
				beforeSend: function (jqXHR, settings) {
					url = settings.url;
				},
				error: function (jqXHR, textStatus, errorThrown) {errOrigin = "parseName"; handleQueryError(jqXHR, textStatus, errorThrown); }
			});
		}, 300);
	} else {
		if (removeLastWords < 20) {
			removeLastWords++; //Try removing another last word and query again
			queryTMDb(thisIndex);
		}
		else {
			errOrigin = "No results";
			handleQueryError();
		}
	}
}

function parseIDMatchResults(json) {
	var json2 = json;
	var results1 = (json2 && json2.results && json2.results[0]);
	
	//tableRow("summaryTable2", "parseIDMatchResults", typeof results1);
	
	if (typeof results1 === "undefined") {
		if (removeLastWords < 20) {
			removeLastWords++; //Try removing another last word and query again
			queryTMDb(thisIndex);
		}
		else {
			errOrigin = "No results";
			handleQueryError();
		}
		return;
	}
	
	removeLastWords = 0;
	
	var tmpB = "https://www.youtube.com/watch?v=" + (json2 && json2.trailers && json2.trailers.youtube &&  json2.trailers.youtube[0] && json2.trailers.youtube[0].source)
	
	//if (thisIndex == allMovieQueries.length) objShell.run(tmpB);
	try{allMovieQueries[thisIndex].sTitle = results1.title;}catch(e){}
	allMovieQueries[thisIndex].sPoster = "http://image.tmdb.org/t/p/w185" + results1.poster_path;
	
	var divSelector = 'div[name="' + allMovieQueries[thisIndex].sQuery + '"]';
	
	
	
	//Set the poster
	$(divSelector + ' img').removeClass("noBoxart");
	$(divSelector + ' img').attr("src", allMovieQueries[thisIndex].sPoster);

	allMovieQueries[thisIndex].sYear = results1.release_date.substring(0, 4);
	allMovieQueries[thisIndex].sRating = Math.floor(Number(results1.vote_average) * 10);
	allMovieQueries[thisIndex].sVoteCount = results1.vote_count;
	allMovieQueries[thisIndex].sSynopsis = results1.overview;
	allMovieQueries[thisIndex].sRuntime = json2.runtime || "";
	allMovieQueries[thisIndex].sRelease = results1.release_date;
	allMovieQueries[thisIndex].JSONGenreList = json2.genres || "";
	allMovieQueries[thisIndex].sBudget = json2.budget || "";
	allMovieQueries[thisIndex].sTagline = json2.tagline || "";
	allMovieQueries[thisIndex].sTrailer = tmpB;
	
	//Set the trailer link
	$(divSelector + ' .LinkButton + span').html(tmpB);
	
	//set the proper title
	$(divSelector).attr("name", allMovieQueries[thisIndex].sTitle);
	
	SaveMovie(allMovieQueries[thisIndex]);
	thisIndex++;
	loaded = 100*(thisIndex / allMovieQueries.length);
	if (thisIndex % 20 === 0) //Every 20 movies, save the xml doc
		xmlDoc.save(saveFile);
	/*if ((thisIndex % 3 === 0)||(thisIndex == allMovieQueries.length)) {
		if (document.getElementById("searchBox").value.length == 0)
			reSortBy(document.getElementById("cmSort").parentNode.childNodes[0].innerHTML);
		else
			filterMovies(document.getElementById("searchBox"));
		getMovieData(thisIndex); 
	}
	else {*/
		getMovieData(thisIndex);
	//}
}

function identifyTitle(e) {
	//get the span where we put the match title
	var s = $(e.parentNode.parentNode.parentNode).find("span");
	
	//get the text of the adjacent input
	e = $(e.parentNode.parentNode).find("input[type=text]").val();
	
	//clean it - should not be needed
	//e = cleanFileName(e, "");
	
	//clear the span
	$(s).text("")
	
	setTimeout(function(){
		$.ajax({
			url: "https://api.themoviedb.org/3/search/movie?query=" + e + "&api_key=" + apikey,
			success: function(data) {
				//alert(JSON.stringify(data));
				if ((data.results) && (data.results[0]) && (data.results[0].title)) {
					$(s).html("<a class='link underline http-link' href='http://www.themoviedb.org/movie/" + data.results[0].id + "' title='http://www.themoviedb.org/movie/" + data.results[0].id + "'>" + data.results[0].title + " (" + data.results[0].release_date.substring(0, 4) + ")</a>");
					UpdateDomLinks();
				}
				else 
					$(s).text("No matches found").fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
			},
			async: false,
			type: 'GET',
			//contentType: 'application/json',
			dataType: 'json',
			beforeSend: function (jqXHR, settings) {
				url = settings.url;
			},
			error: function () {
			
			}
		});
	}, 300);
	

}

function handleQueryError(jqXHR, textStatus, errorThrown) {
	if  (textStatus !== "error")	{
		removeLastWords = 0;
		pCount++;
		
		var tmpZ = ((typeof jqXHR !== "undefined") && (typeof textStatus !== "undefined")) ? jqXHR.status + ", " + textStatus:"None" ;
		document.getElementById("problemTable").innerHTML += "<tr><td>" + 
		'<a style="cursor:pointer;" title="' + allMovieQueries[thisIndex].sFilePath + '" onclick="exploreMov(' + "this" + ');">' + allMovieQueries[thisIndex].sFilePath + '</a><span style="display:none">' + allMovieQueries[thisIndex].sFilePath + '</span></td><td>' + 
		allMovieQueries[thisIndex].sQuery  + "</td><td>" +
		"<a href='"+ url + "'>" + url + "</a></td><td>" +
		tmpZ + "</td><td>" +
		((errOrigin.length)?errOrigin:"Unknown") + "</td></tr>";
		
		tableRow("renameTable", "<a class='link underline file-link' title='" + allMovieQueries[thisIndex].sFilePath + "'>" + allMovieQueries[thisIndex].sFilePath + "</a>", "<div class='wrap-none'><input onkeypress='handleKeyPress(this, event)' type='text' size='50' value='" + allMovieQueries[thisIndex].sOriginal + "'></input> <input type='button'   onclick='identifyTitle(this)' value='Identify' class='btn'></input> <input type='button' value='blacklist' class='btn btn-danger'></input></div>", "<span class=''>" + noMatchText + "</span>");
		
		$("#problemCount").html($("#renameTable tr").length - 1);
		if ($("#renameTable tr").length - 1)
			$("#divProblems").show();
		
		removeTemporaryBoxart(allMovieQueries[thisIndex].sFilePath);
		var divSelector = 'div[name="' + allMovieQueries[thisIndex].sQuery + '"]';
		var divGroup = $(divSelector).parent();
		//delete the coverart
		$(divSelector).remove();
		//if it was the only one in it's group (IE only movie stating with letter "A")
		if ($(divGroup).children("div.CoverArt").length == 0)
			$(divGroup).remove(); //then remove the whole group
		
		thisIndex++;
		getMovieData();
	}
	else {
		tableRow("summaryTable2", "textStatus", textStatus, "error thrown",errorThrown );
		if (errorThrown == "NetworkError") {
			xmlDoc.save(saveFile);
			document.getElementsByTagName("title")[0].innerHTML = "MovieBox (Offline)";
			//$("#divDialogue").show();
			$("#divDialogue").html("Offline mode");
			$("#initSmall").html("No internet connection");
			$("#h1Content").after('<input type="button" value="Refresh" onclick="location.reload()" class="btn-secondary"></input>')
			
		}
	}
}