var results1;
var removeLastWords = 0;
var pCount = 0;
var apikey = "f42a97260991ec6440ccfe4e8ef2f4c4";
var url;
var errOrigin;

function getQueryList() {
	if (typeof concatSavedFiles === "undefined")  {
		allMovieQueries = allMovies;
		return;
	}
	for (var i = 0; i < allMovies.length; i++)
		if (concatSavedFiles.indexOf(allMovies[i].sFilePath) < 0)
			allMovieQueries.push(allMovies[i]);

	thisIndex = 0;
	return;
}

function getMovieData() {
	document.getElementsByTagName("title")[0].innerHTML = "MovieBox is working... (" + (thisIndex) + " of " + (allMovieQueries.length + showCount) + ")";
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
	setTimeout(function(){
		$.ajax({
			url: "https://api.themoviedb.org/3/search/movie?query=" + a + b + "&api_key=" + apikey,
			success: parseNameMatchResults,
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

function parseIDMatchResults(json2) {
	var tmpB = "null";
	if (typeof json2.trailers.youtube[0] != "undefined")
		tmpB = "https://www.youtube.com/watch?v=" + json2.trailers.youtube[0].source; //http://www.youtube.com/v/
	//if (thisIndex == allMovieQueries.length) objShell.run(tmpB);
	try{allMovieQueries[thisIndex].sTitle = results1.original_title;}catch(e){}
	allMovieQueries[thisIndex].sPoster = "http://image.tmdb.org/t/p/w185" + results1.poster_path;
	allMovieQueries[thisIndex].sYear = results1.release_date.substring(0, 4);
	allMovieQueries[thisIndex].sRating = Math.floor(Number(results1.vote_average) * 10);
	allMovieQueries[thisIndex].sVoteCount = results1.vote_count;
	allMovieQueries[thisIndex].sSynopsis = "9999";
	allMovieQueries[thisIndex].sRuntime = "99";
	allMovieQueries[thisIndex].sRelease = results1.release_date;
	allMovieQueries[thisIndex].JSONGenreList = json2.genres;
	allMovieQueries[thisIndex].sBudget = json2.budget;
	allMovieQueries[thisIndex].sTrailer = tmpB;
	SaveMovie(allMovieQueries[thisIndex]);
	thisIndex++;
	loaded = 100*(thisIndex / allMovieQueries.length);
	if (thisIndex % 20 === 0) //Every 20 movies, save the xml doc
		xmlDoc.save(saveFile);
	if ((thisIndex % 3 === 0)||(thisIndex == allMovieQueries.length)) {
		if (document.getElementById("searchBox").value.length == 0)
			reSortBy(document.getElementById("cmSort").parentNode.childNodes[0].innerHTML);
		else
			filterMovies(document.getElementById("searchBox"));
		getMovieData(thisIndex); 
	}
	else {
		getMovieData(thisIndex);
	}
}
function handleQueryError(jqXHR, textStatus, errorThrown) {
	/*if  (typeof textstatus === "undefined")	{*/
		removeLastWords = 0;
		pCount++;
		document.getElementById("problemCount").innerHTML = pCount;
		var tmpZ = ((typeof jqXHR !== "undefined") && (typeof textStatus !== "undefined")) ? jqXHR.status + ", " + textStatus:"None" ;
		document.getElementById("problemTable").innerHTML += "<tr><td>" + 
		'<a style="cursor:pointer;" title="' + allMovieQueries[thisIndex].sFilePath + '" onclick="exploreMov(' + "this" + ');">' + allMovieQueries[thisIndex].sFilePath + '</a><span style="display:none">' + allMovieQueries[thisIndex].sFilePath + '</span></td><td>' + 
		allMovieQueries[thisIndex].sQuery  + "</td><td>" +
		"<a href='"+ url + "'>" + url + "</a></td><td>" +
		tmpZ + "</td><td>" +
		((errOrigin.length)?errOrigin:"Unknown") + "</td></tr>";
		
		removeTemporaryBoxart(allMovieQueries[thisIndex].sFilePath);
		thisIndex++;
		getMovieData();
	/*}*/
	/*else {
		//if (textStatus !== "timeout") //could try 1 more time before going into offline mode
		xmlDoc.save(saveFile);
		document.getElementsByTagName("title")[0].innerHTML = "MovieBox (Offline)";
	}*/
}