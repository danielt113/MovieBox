<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!-- <xsl:sort select="substring(Title, 1 + 4*starts-with(Title, 'The ') + 4*starts-with(Title, 'the '))"/>  -->

<xsl:key name="groups" match="Movie/Year | Show/Year" use="."/>

   <xsl:template match="/Movies">
   		<xsl:choose>
			<xsl:when test="(count(Show/Episode) + count(Movie)) > 0">
				 <div style="clear: both;">
					 <xsl:apply-templates select="Movie/Year[generate-id() = generate-id(key('groups', .)[1])] | Show/Year[generate-id() = generate-id(key('groups', .)[1])]">
						 <xsl:sort select="." data-type="number" order="descending"/>
					</xsl:apply-templates>
				</div>
			</xsl:when>
				<xsl:otherwise>
					<p>No movies or episodes found.</p>
					<input onclick="openSettings()" type="button" value="Go to settings" class="btn-secondary"/>
				</xsl:otherwise>
		</xsl:choose>
   </xsl:template>

   <xsl:template match="Year">
      <xsl:variable name="currentGroup" select="."/>
      <div style="float: left;" ><!-- title="{../Title} (${format-number(../Budget div 1000000, '###,###')}M)" -->
            <h1><xsl:value-of select="$currentGroup"/></h1>
         <xsl:for-each select="key('groups', $currentGroup)">
			<xsl:sort select="translate(../Release,'-','')" data-type="number" order="descending"/>
			
			<xsl:variable name="MovieOrShow">
				<xsl:choose>
					<xsl:when test="name(parent::*)='Movie'">
						Movie
					</xsl:when>
					<xsl:otherwise>
						TVShow
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>	
		
			  <div name="{.}" data-filepath="{../Filepath}" class="{$MovieOrShow} CoverArt {../Quality}">
	
				<figure onclick="expandDetails(this)">
					<xsl:choose>
						<xsl:when test="../Poster!=''">
							<img src="{../Poster}" alt="{../Title}"></img>
						</xsl:when>
						<xsl:otherwise>
							<img src="" alt="" class="noBoxart"></img>
						</xsl:otherwise>
					</xsl:choose>
					
					<big class="bigAlt"><xsl:value-of select="../Title"/></big>
					<figcaption>

					</figcaption>
					
					</figure>
				</div>
					
         </xsl:for-each>
      </div>
   </xsl:template>
</xsl:stylesheet>
