var thisShowIndex = 0;
var thisShowID;

var seasonsCount = 0;

var thisSeasonIndex;
var thisSeason;

function getShowData() {	

	//First function called 
	//$("#Boxart").append(JSON.stringify(allShowQueries) + "<br><br>")
	//$("#Boxart").html(JSON.stringify(allShowQueries))
	getShowIDs();

}

function getShowIDs() {
	
	//Update title to show progress
	document.getElementsByTagName("title")[0].innerHTML = "MovieBox is working... (" + (thisIndex) + " of " + (allMovieQueries.length + seasonQueryCount + showQueryCount) + ")";
	
	//find out what each show ID is
	
	if (thisShowIndex < allShowQueries.length) {
	
		//check if we already have an id
		if ((typeof allShowQueries[thisShowIndex].sID === "undefined") || (allShowQueries[thisShowIndex].sID.length == 0))
			queryTMDbForShow();
		
		else {
			//if we have an id then skip
			thisShowIndex++;
			getShowIDs();
		}
			
	}
	
	//if done the last show
	else if(allShowQueries.length) {
		
		//add up number of season queries
		for (var i = 0; i < allShowQueries.length; i++) {
			seasonsCount += allShowQueries[i].sSeasons.length;
		}
		
		//set first show
		thisShowIndex = 0;
		
		//set first season
		thisSeasonIndex = 0;
		
		//Start querying each one
		getSeasons();
	}
	
	//if there are no shows
	else {
		continueMe();
	}
}

function getSeasons() {
	
	//Update title to show progress
	document.getElementsByTagName("title")[0].innerHTML = "MovieBox is working... (" + (thisIndex) + " of " + (allMovieQueries.length + seasonQueryCount + showQueryCount) + ")";
	
	//get each season worth of data for every show
	//If within this show's seasons
	if (thisSeasonIndex < allShowQueries[thisShowIndex].sSeasons.length)
		queryTMDBForSeason();

	//If beyond this show's seasons go to next show, 
	else {
		
		//save this shows data
		saveShow(allShowQueries[thisShowIndex]);
		tableRow("summaryTable2", "getSeasons", "saving XMLDoc", allShowQueries[thisShowIndex].sTitle);
		xmlDoc.save(saveFile);
		
		//next show index
		thisShowIndex++;
	
		//Check if there is still a show at this index
		if (thisShowIndex < allShowQueries.length) {
			
			//reset season index
			thisSeasonIndex = 0;
			
			queryTMDBForSeason();
			
		}
	
		else {
			continueMe();
		}
	}
	
}


function queryTMDbForShow() {
	setTimeout(function(){
		thisIndex++;
		tableRow("summaryTable2", "queryTMDbForShow", "https://api.themoviedb.org/3/search/tv?query=" + encodeURI(allShowQueries[thisShowIndex].sTitle) + "&api_key=" + apikey);
		$.ajax({
			url: "https://api.themoviedb.org/3/search/tv?query=" + encodeURI(allShowQueries[thisShowIndex].sTitle) + "&api_key=" + apikey,
			success: parseShowMatchResults,
			async: false,
			type: 'GET',
			contentType: 'application/json',
			beforeSend: function (jqXHR, settings) {
					url = settings.url;
				},
			dataType: 'jsonp',
			error: handleShowQueryError
		});
	}, 300);
}

function parseShowMatchResults(json) {
	var useResultNum = 0;
	
	if (json.total_results > 0) {
		
		//if more than one result, in the case of "The Walking Dead" tMDB returned "Fear the Walking Dead" first over "The Walking Dead"
		if (json.total_results > 1) {
			for (var i = 0; i < json.total_results; i++) {
				//Check if there's a title that happens to exactly match this show's title
				if (json.results[i].name.toLowerCase() == allShowQueries[thisShowIndex].sTitle.toLowerCase()) {
					useResultNum = i;
					break;
				}
			}
		}
		
		thisShowID = json.results[useResultNum].id;
		allShowQueries[thisShowIndex].sPoster = "http://image.tmdb.org/t/p/w185" + json.results[useResultNum].poster_path;
		
		//Set the poster
		var divSelector = 'div[name="' + allShowQueries[thisShowIndex].sTitle + '"]';
		$(divSelector + ' img').removeClass("noBoxart");
		$(divSelector + ' img').attr("src", allShowQueries[thisShowIndex].sPoster);
		
		allShowQueries[thisShowIndex].sTitle = json.results[useResultNum].name;
		allShowQueries[thisShowIndex].sYear = json.results[useResultNum].first_air_date.substring(0,4);
		allShowQueries[thisShowIndex].sID = json.results[useResultNum].id;
		
		//set the proper title
		$(divSelector).attr("name", allShowQueries[thisShowIndex].sTitle);
		
		thisShowIndex++;
		
		getShowIDs();
	}
}

function queryTMDBForSeason() {
	
	tableRow("summaryTable2", "getSeasons", allShowQueries[thisShowIndex].sTitle, "season", allShowQueries[thisShowIndex].sSeasons[thisSeasonIndex]);
	
	setTimeout(function(){
		thisIndex++;
		$.ajax({
			url: "https://api.themoviedb.org/3/tv/" + allShowQueries[thisShowIndex].sID + "/season/" + allShowQueries[thisShowIndex].sSeasons[thisSeasonIndex] + "?api_key=" + apikey,
			success: parseSeasonResults,
			async: false,
			type: 'GET',
			contentType: 'application/json',
			beforeSend: function (jqXHR, settings) {
					url = settings.url;
				},
			dataType: 'jsonp',
			error:  function(result) {
				if (result.status == 200 && result.statusText == 'OK') {
					//we're fine
				}
				else {
					tableRow("problemTable", "code", result.status, "text", result.statusText);
				}
			},
		});
	}, 300);
}

function parseSeasonResults(json) {
	//$("#Boxart").append(JSON.stringify(json) + "<br><br>");
	
	//set each episodes data
	//try {
		for (var i = 0; i < allShowQueries[thisShowIndex].sEpisodes.length; i++) {
			
			//current episode
			var epi = allShowQueries[thisShowIndex].sEpisodes[i];
			
			//tableRow("summaryTable2", "parseSeasonResults", "show", allShowQueries[thisShowIndex].sTitle, "season", epi.sSeason, "episode", epi.sEpisode);
			
			//tableRow("summaryTable2", "parseSeasonResults", "show", allShowQueries[thisShowIndex].sTitle, "length", i);
			
			//Make sure this episode is in this season worth of data
			if (epi.sSeason == allShowQueries[thisShowIndex].sSeasons[thisSeasonIndex]) {
				epi.sOverview = json.episodes[epi.sEpisode - 1].overview || "No overview available.";
				epi.sTitle = json.episodes[epi.sEpisode - 1].name || "Episode";
				epi.sRating = json.episodes[epi.sEpisode - 1].vote_average || 0;
				epi.sVoteCount = json.episodes[epi.sEpisode - 1].vote_count || 0;
			}
		}
	/*}
	catch (e) {
		tableRow("summaryTable2", "getSeasons - error", "season", epi.sSeason, "episode", epi.sEpisode)
		$("#Boxart").append(JSON.stringify(json));
		return;
	}*/
	
	
	thisSeasonIndex++;
	
	getSeasons();
}

function handleShowQueryError(jqXHR, textStatus, errorThrown) {

}