var startedAt = 0;
var queueControl = "";
var frequency = 1000;
var lastQueryTime;
var ignoreLastQuery = false;
var pauseSentAt = -1;
var maxOffset = 0.5; //in seconds
var ignoreNextEvent = 0;

function joinPartyA(sPath, e) {
	
	if(e.key !== 'Enter')
        return
	
	objShell.Run('"' + objShell.CurrentDirectory + "\\resources\\hta\\MovieboxPlayer.hta" + '" ' + escape(htmlDecode($(sPath).data("filepath"))) + " " + sPath.value);
	
	//put date attribute on the movie in the xml DB
	var thisFile = getMovie($(sPath).data("filepath"));
	var d = new Date().valueOf();
	$(thisFile).attr("LastWatched", d);
	xmlDoc.save(saveFile);
	
	return;
	/*
	var p = sPath.value;
	pages.partyplayer.navigateTo();
	$("#vid").get(0).src = htmlDecode($(sPath).data("filepath"));
	$("#partyID").text(p);
	$("#h1text").text("Party: ");
	
	joinParty();*/
}

function startParty(sPath) {
	
	//alert('"' + objShell.CurrentDirectory + "\\resources\\hta\\MovieboxPlayer.hta" + '" ' + escape(htmlDecode($(sPath).data("filepath"))) + '' + " new" + '');

	objShell.Run('"' + objShell.CurrentDirectory + "\\resources\\hta\\MovieboxPlayer.hta" + '" ' + escape(htmlDecode($(sPath).data("filepath"))) + '' + " new" + '');
	
	//put date attribute on the movie in the xml DB
	var thisFile = getMovie($(sPath).data("filepath"));
	var d = new Date().valueOf();
	$(thisFile).attr("LastWatched", d);
	xmlDoc.save(saveFile);
	
	return;
}

function joinParty() {
	if (isNaN($("#partyID").text()))
		return;
		
	var xhttp = new XMLHttpRequest();
	
	$("#statusBox").text("Joining party...");
	$("#h1text").text("Joining: ");
	
	xhttp.onreadystatechange = function() {

		if (this.readyState == 4 && this.status == 200) {
		
		var j = JSON.parse(xhttp.responseText);
		
		if (j.queryStatus == "error") {
			//$("#statusBox").text("That party is finished");
			//$("#h1text").text("That party is over");
			//$("#h1text").text("");
			return;
		}
		
		//success, use xhttp.responseText
		$("#statusBox").text(j.status + " at " + readableTime((j.timeStamp)));
		$("#h1text").text("Party: ");
		startedAt = new Date().getTime();
		
		setMoviePartyEvents();
		pollParty();

		}

		if (this.readyState == 4 && this.status !== 200) {

			$("#statusBox").text("Something went wrong");

		}
	}

	xhttp.open("GET", "http://movieboxparty.herokuapp.com/watch?party=" + $("#partyID").text() + "&controllerTime=" + new Date().getTime(), true);

	xhttp.send();
}
function setMoviePartyEvents() {
	var v = $("#vid");
	
	v.on("pause", function(){
		$("#statusBox").text("Paused");
		if (pauseSentAt == v.get(0).currentTime)
			return;
		if (ignoreNextEvent > 0) {
			ignoreNextEvent--;
			tableRow("partyTable","event", "ignored pause");
			return;
		}
		//tableRow("partyTable","Event: pause", status, Math.round(1*(startedAt - new Date().getTime()) / 100)/10);
		queueControl = "&status=pause";
		sendPartyController("&status=pause");
		
		pauseSentAt = v.get(0).currentTime;
	})
	
	v.on("play", function(){
		if (ignoreNextEvent > 0) {
			ignoreNextEvent--;
			tableRow("partyTable","event", "ignored play");
			return;
		}
		queueControl = "&status=play";
		sendPartyController("&status=play");
		$("#statusBox").text("play");
	})
	
	//these use too many server calls
	v.on("seeking", function(){
		if (ignoreNextEvent > 0) {
			ignoreNextEvent--;
			tableRow("partyTable","event", "ignored seeking");
			return;
		}
		$("#statusBox").text("seeking");
		//alert(v.get(0).currentTime);
		if (pauseSentAt == v.get(0).currentTime)
				return;
		queueControl = "&status=pause";
		sendPartyController("&status=pause");
		
		pauseSentAt = v.get(0).currentTime;
	})
	
	v.on("seeked", function(){
		$("#statusBox").text("seeked");
		if (ignoreNextEvent > 0) {
			ignoreNextEvent--;
			tableRow("partyTable","event", "ignored seeked");
			return;
		}
		if (v.get(0).currentTime > 0 && !v.get(0).paused && !v.get(0).ended)
			sendPartyController("&status=play");
		else {
			if (pauseSentAt == v.get(0).currentTime)
				return;
			sendPartyController("&status=pause");
			pauseSentAt = v.get(0).currentTime;
		}
	})
	
}

function sendPartyController(status){
	var xhttp = new XMLHttpRequest();
	
	xhttp.onreadystatechange = function() {

		if (this.readyState == 4 && this.status == 200) {

			var j = JSON.parse(xhttp.responseText);
			
			if (j.queryStatus == "error")
				$("#statusBox").text("Something went wrong");
				
			//$("#statusBox").text(j.queryStatus);
			
			ignoreLastQuery = false;

		}

		if (this.readyState == 4 && this.status !== 200) {

			$("#statusBox").text("Couldn't send " + status);

		}
	}
	tableRow("partyTable","Control", status + " at " + readableTime(($("#vid").get(0).currentTime)),"elapsed " +  new Date().getTime());
	
	ignoreLastQuery = true;
	xhttp.open("POST", "http://movieboxparty.herokuapp.com/controller?party=" + $("#partyID").text() + "&timestamp=" + $("#vid").get(0).currentTime + status + "&controllerTime=" + new Date().getTime(), true);

	xhttp.send();
}
function pollParty() {
	
	if (isNaN($("#partyID").text()))
		return;
		
	var v = $("#vid").get(0);
		
	var xhttp = new XMLHttpRequest();
	
	xhttp.onreadystatechange = function() {

		if (this.readyState == 4 && this.status == 200) {
			
			if (!ignoreLastQuery) {
		
				var j = JSON.parse(xhttp.responseText);
				
				if (j.queryStatus == "error") {
					$("#statusBox").text("The party is over");
					clearInterval(interval);
					return;
				}
				
				//success, use xhttp.responseText
				
				var deltaTimeSeconds = (new Date().getTime() - parseFloat(j.controllerTime)) / 1000;
				
				$("#statusBox").text(j.status + " at " + readableTime((parseFloat(j.timeStamp) + deltaTimeSeconds)));
				
				//$("#partyID").text(xhttp.responseText);
							
				
				
				switch (j.status) {
					case "play":
						//alert(parseFloat(j.timeStamp) + deltaTimeSeconds);
						if (v.currentTime < parseFloat(j.timeStamp) + deltaTimeSeconds - maxOffset || v.currentTime > parseFloat(j.timeStamp) + deltaTimeSeconds + maxOffset )
							try {
								ignoreNextEvent++;
								ignoreNextEvent++;
								v.currentTime = parseFloat(j.timeStamp) + deltaTimeSeconds;
								tableRow("partyTable","Poll", "Play/jump to " + readableTime((parseFloat(j.timeStamp) + deltaTimeSeconds)),"elapsed " + new Date().getTime());
							}
							catch(e){
								//alert("At " + v.currentTime + " and failed trying to skip to " + Math.round(10*parseFloat(j.timeStamp))/10)
							}
						
						//$("#statusBox").text(parseFloat(j.timeStamp) + deltaTimeSeconds);
						
						if (v.currentTime == 0 || v.paused == true) {
							if (v.ended == false) {
								ignoreNextEvent++;
								v.play();
								tableRow("partyTable","Poll", "Play at " + readableTime((parseFloat(j.timeStamp) + deltaTimeSeconds)),"elapsed " + new Date().getTime());
							}
						}
						
					break;
					
					case "pause":
						$("#statusBox").text(j.status + " at " + parseFloat(j.timeStamp));
						try{
							if (v.currentTime !== parseFloat(j.timeStamp)) {
								ignoreNextEvent++;
								ignoreNextEvent++;
								v.currentTime = parseFloat(j.timeStamp);
								tableRow("partyTable","Poll", "Pause/jump to " + readableTime((parseFloat(j.timeStamp) + deltaTimeSeconds)),"elapsed " + new Date().getTime());
							}
						}
						catch(e){
							//alert("At " + v.currentTime + " and failed trying to skip to " + parseFloat(j.timeStamp))
						}
						if (v.paused !== true) {
							ignoreNextEvent++;
							v.pause();
							tableRow("partyTable","Poll", "Pause at " + readableTime((parseFloat(j.timeStamp) + deltaTimeSeconds)),"elapsed " + new Date().getTime());
						}
						
					break;
				}
			}
			else {
				//tableRow("partyTable","Watch (ignored)", Math.round(1*(startedAt - new Date().getTime()) / 100)/10);
			}
			
			timeToNextQuery = frequency - (new Date().getTime() - lastQueryTime);
			
			if (timeToNextQuery <= 0 ) {
				//tableRow("partyTable","poll now", timeToNextQuery);
				pollParty();
			}
			else {
				//tableRow("partyTable","poll in ", timeToNextQuery);
				setTimeout(pollParty, timeToNextQuery);
				
			}
			
		}

		if (this.readyState == 4 && this.status !== 200) {

			$("#statusBox").text("Something went wrong");
			clearInterval(interval);

		}
	}
	//tableRow("partyTable","Watch", Math.round(1*(startedAt - new Date().getTime()) / 100)/10);
	$("#connectionBox").text("elapsed " + readableTime(Math.round(1*(new Date().getTime() - startedAt) / 100)/10))
	
	
	lastQueryTime = new Date().getTime();
	xhttp.open("GET", "http://movieboxparty.herokuapp.com/watch?party=" + $("#partyID").text() + "&controllerTime=" + new Date().getTime(), true);

	xhttp.send();

}

function readableTime(s){
	var m = 0;
	s = Math.floor(parseInt(s));
	if (s > 60) {
		m = Math.floor(s / 60);
		s = s % 60;
		return m + "m " + s + "s";
	}
	else {
		return s + "s";
	}
}