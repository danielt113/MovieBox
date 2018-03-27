
var pages = [];

function Page(name, file, onLoad, onNavigate, onExit) {
	//Convert the file text into navigable DOM nodes
	this.file = file;

	try {
		f = objFSO.OpenTextFile(file, 1); //1 = reading, example c://settings.html
		// Read from the file.
		if (f.AtEndOfStream)
			this.content = "";
		else
			this.content = $.parseHTML(f.ReadAll());
	
	} 
	
	catch(e) {tableRow("summaryTable2","Error Loading Page content", name, e.message, file)}
	finally {
		if (f != null)
			f.Close();
	}
	
	//Set basic properties
	this.name = name;
	this.onLoad = onLoad;
	this.onNavigate = onNavigate;
	this.onExit = onExit;
	
	//Build navigation function
	this.navigateTo = function() {
		//tableRow("summaryTable2", "navigateTo", this.name);
		
		//if there's no current page, then set it as an object
		if (typeof pages.current === "undefined")
			pages.current = {};
		else {
			//unload the current page if there is one
			if (typeof pages.current.onNavigate === "function")
				pages.current.onNavigate();
		}
		
		//set the new current page
		pages.current = this;
		
		//place the content in the main container
		$("#pageContainer").html(this.content);

		//anchor to the pagename
		window.location = ("" + window.location).replace(/#[^\^[\]{}\\"<>\/]*$/,'') + "#" + this.name;
		
		//execute the new onLoad function
		if (typeof this.onLoad === "function") {
			this.onLoad();
		}
	}
}

function Include(content, onLoad) {
	this.content = content;
	this.onLoad = onLoad;
}

/*
Page.prototype.init = function () {
	this. 
}
*/