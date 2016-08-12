
//Look for any files with these extensions
var knownExtensions = ".3g2.3gp.3gp2.3gpp.amv.asf.drc.dv.f4v.flv.gxf.m1v.m2t.m2v.m2ts.m4v.mkv.mov.mp2.mp2v.mp4.mp4v.mpa.mpe.mpeg.mpeg1.mpeg2.mpeg4.mpg.mpv2.mts.mtv.mxf.nsv.nuv.ogg.ogm.ogx.ogv.rec.rm.rmvb.tod.ts.tts.vob.vro.webm.wmv.avi.divx.";

//MS special folders
var knownSpecialFolders = ["Desktop", "MyDocuments", "MyVideos", "CommonVideos", "UserProfile"];

//registries to check for movies, such as the downloads folder (registry)
var knownRegistries = ["HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders\\{374DE290-123F-4565-9164-39C4925E467B}"];

//save file name
var saveFile = "Movie-Data.xml";//objShell.SpecialFolders(knownSpecialFolders[1]) + '\\MovieBox\\Movie-Data.xml';

//location of save file
var saveFileFolder = objShell.SpecialFolders(knownSpecialFolders[1]) + '\\MovieBox';

var noMatchText = "No matches found";

//location of XSL transform files
var xslFolder = 'resources\\xsl\\';

//tMDB API key for movie data
var apikey = "f42a97260991ec6440ccfe4e8ef2f4c4";

//Common abbreviations for shows
var knownShowAbbreviations = {
	GOT : "Game of Thrones",
	HIMYM : "How I Met Your Mother",
	BMS : "Blue Mountain State",
	WLIIA : "Who's Line Is it Anyway?",
};

//Words in movie titles that will not be capitalized, roman numerals are found using RegEx and always capitalized
var dontCapitalize = ["a", "an", "the", "at", "by", "for", "in", "of", "on", "to", "up", "and", "as", "but", "or", "nor"];