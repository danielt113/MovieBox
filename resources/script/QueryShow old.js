var thisShowIndex = 0;var thisEpisodeIndex = -1;var thisIndex = 0;var ctrEpisodes = 0;
var thisShowID;

function getShowData() {//alert("E: " + thisEpisodeIndex + " S: " + thisShowIndex + " number of shows: " + allShows.length);
	document.getElementsByTagName("title")[0].innerHTML = "MovieBox is working... (" + (thisIndex + ctrEpisodes) + " of " + Number(allMovies.length + showCount) + ")";
	if (thisShowIndex >= allShows.length) {
		continueMe();
		return 0;
	}
	else if (thisEpisodeIndex == -1) {
		//if starting a new show's query, query for show ID
		if ((concatSavedShows === undefined) || (concatSavedShows.toUpperCase().indexOf("&" + allShows[thisShowIndex].sTitle.toUpperCase() + "&") < 0)) {
			//If we haven't saved any shows or can't find this show saved then query for it
			queryTMDbForShow();
		}
		else { //The logic below is untested: shows added as temporary and then saved may not have an ID 
				//instead it could delete the temporary boxarts before saving
			//If the show does exist start the episode queries (gets picked up if we have already queried the episode)
			thisShowID = "";
			var allRows = xmlDoc.getElementsByTagName("Show");
			for (var i = 0; i < allRows.length; i++) {
				if (allRows[i].getElementsByTagName("Title")[0].childNodes[0].nodeValue.toUpperCase() == allShows[thisShowIndex].sTitle.toUpperCase()) {
					if (allRows[i].getElementsByTagName("ID")[0].childNodes[0] != null) 
						thisShowID = allRows[i].getElementsByTagName("ID")[0].childNodes[0].nodeValue;
				}
			}
			
			if (thisShowID == "") {
				//This only happens if a show was saved in the xml doc without being queried
				concatSavedShows.replace("&" + allShows[thisShowIndex].sTitle + "&", "&");
				queryTMDbForShow();
			}
			else {
				thisEpisodeIndex++;
				getShowData();
			}
			
		}
		
	}
	else if (thisEpisodeIndex >= allShows[thisShowIndex].sEpisodes.length) {
		//If we finish querying a shows episodes
		saveShow(allShows[thisShowIndex]);
		xmlDoc.save(saveFile);
		//Resort to show this shows boxart
		/*if (document.getElementById("searchBox").value.length == 0)
			reSortBy(document.getElementById("cmSort").parentNode.childNodes[0].innerHTML);
		else
			filterMovies(document.getElementById("searchBox"));*/
		thisEpisodeIndex = -1;
		thisShowIndex++;
		getShowData();
	}
	else {
		if ((concatSavedEpisodes === undefined) || (concatSavedEpisodes.indexOf(allShows[thisShowIndex].sEpisodes[thisEpisodeIndex].sFilepath) < 0)) {
			ctrEpisodes++;
			queryTMDbForEpisode();
		}
		else {
			ctrEpisodes++;
			thisEpisodeIndex++;
			getShowData();
		}
	}
}

function queryTMDbForEpisode() {
	setTimeout(function(){
		$.ajax({
			url: "https://api.themoviedb.org/3/tv/" + thisShowID + "/season/" + allShows[thisShowIndex].sEpisodes[thisEpisodeIndex].sSeason + "/episode/" + allShows[thisShowIndex].sEpisodes[thisEpisodeIndex].sEpisode + "?api_key=" + apikey,
			success: parseEpisodeMatchResults,
			async: false,
			type: 'GET',
			contentType: 'application/json',
			dataType: 'jsonp',
			beforeSend: function (jqXHR, settings) {
					url = settings.url;
				},
			error: handleShowQueryError
		});
	}, 300);
}

function parseEpisodeMatchResults(json) {
	allShows[thisShowIndex].sEpisodes[thisEpisodeIndex].sOverview = json.overview;
	allShows[thisShowIndex].sEpisodes[thisEpisodeIndex].sTitle = json.name;
	thisEpisodeIndex++;
	getShowData();
}

function queryTMDbForShow() {
	setTimeout(function(){
		$.ajax({
			url: "https://api.themoviedb.org/3/search/tv?query=" + encodeURI(allShows[thisShowIndex].sTitle) + "&api_key=" + apikey,
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
	var bestGuess = 0;
	
	if (json.total_results > 0) {
		thisShowID = json.results[0].id;
		allShows[thisShowIndex].sPoster = "http://image.tmdb.org/t/p/w185" + json.results[0].poster_path;
		
		//Set the poster
		var divSelector = 'div[name="' + allShows[thisShowIndex].sTitle + '"]';
		$(divSelector + ' img').removeClass("noBoxart");
		$(divSelector + ' img').attr("src", allShows[thisShowIndex].sPoster);
		
		allShows[thisShowIndex].sTitle = json.results[0].original_name;
		allShows[thisShowIndex].sYear = json.results[0].first_air_date.substring(0,4);
		allShows[thisShowIndex].sID = json.results[0].id;
		thisEpisodeIndex++;
		
		/*setTimeout(function(){
			$.ajax({
				url: "https://api.themoviedb.org/3/tv/" + thisShowID + "/season/1" + "?api_key=" + apikey,
				success: function(result) {
					$("#Boxart").append(JSON.stringify(result))
					
				},
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
		return;*/
		getShowData();
	} 
	else {
		thisEpisodeIndex = -1;
		thisShow++;
		getShowData();
	}
}

function handleShowQueryError(jqXHR, textStatus, errorThrown) {
	/*if ((jqXHR === undefined)||(jqXHR.status != 200)) {*/
		if (thisEpisodeIndex = -1) { //Failed querying for the show (this show will not work skip to next)
			thisShowIndex++;
			getShowData();
		}
		else { //Failed querying for this episode, skip to next episode
			ctrEpisodes++;
			thisEpisodeIndex++;
			getShowData();
		}
	/*}
	else {
		xmlDoc.save(saveFile);
		document.getElementsByTagName("title")[0].innerHTML = "MovieBox (Offline)";
	}*/
}