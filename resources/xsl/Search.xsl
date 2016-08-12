<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!-- <xsl:sort select="substring(Title, 1 + 4*starts-with(translate(Title, $smallcase, $uppercase), 'THE '))"/>  -->

	<xsl:template match="/Movies">
	<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'" />
	<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />
	<xsl:variable name="searchString" select="translate(Search/@Text, $smallcase, $uppercase)"/>
   
   <div style="float: left" class="textDiv">
	<h1 style="margin-top:0;">Search: "<xsl:value-of select="Search/@Text"/>"</h1>
	<xsl:choose>
	<xsl:when test="Movie[contains(translate(Title, $smallcase, $uppercase),$searchString)] | Show[contains(translate(Title, $smallcase, $uppercase),$searchString)]">
         <xsl:for-each select="Movie[contains(translate(Title, $smallcase, $uppercase),$searchString)] | Show[contains(translate(Title, $smallcase, $uppercase),$searchString)]">
		 
			<xsl:sort select="string-length(substring-before(substring(translate(Title, $smallcase, $uppercase), 1 + 4*starts-with(translate(Title, $smallcase, $uppercase), 'THE ')), $searchString))" data-type="number" order="ascending"/>
			<xsl:sort select="Title"/>
					
			  <xsl:variable name="MovieOrShow">
				<xsl:choose>
					<xsl:when test="name(current())='Movie'">
						Movie
					</xsl:when>
					<xsl:otherwise>
						TVShow
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>	
		
			  <div name="{.}" data-filepath="{Filepath}" class="{$MovieOrShow} CoverArt {Quality}">
				
				<figure onclick="expandDetails(this)">
						<xsl:choose>
							<xsl:when test="Poster!=''">
								<img src="{Poster}" alt="{Title}"></img>
							</xsl:when>
							<xsl:otherwise>
								<img src="" alt="" class="noBoxart"></img>
							</xsl:otherwise>
						</xsl:choose>
					<big class="bigAlt"><xsl:value-of select="Title"/></big>
					<figcaption>
						
					</figcaption>
					
					</figure>
				</div>
					
         </xsl:for-each>
		 </xsl:when>
		<xsl:otherwise>
			<p>There are no results.</p>
			<input onclick="$('#searchBox').val('');filterMovies(document.getElementById('searchBox'))" type="button" value="Go back" class="btn-secondary"/>
		</xsl:otherwise>
</xsl:choose>
		 </div>
   </xsl:template>
</xsl:stylesheet>
