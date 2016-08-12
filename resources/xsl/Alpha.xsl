<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!-- <xsl:sort select="substring(Title, 1 + 4*starts-with(., 'The ') + 4*starts-with(., 'the '), 1)"/>  -->

<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'" />
<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />
<xsl:key name="groups" match="Movie/Title | Show/Title" use="substring(., 1 + 4*starts-with(., 'The '), 1)"/>

   <xsl:template match="Movies">
		<xsl:choose>
			<xsl:when test="(count(Show/Episode) + count(Movie)) &gt; 0">
				<div style="clear: both;">	
					<xsl:apply-templates select="Movie/Title[generate-id() = generate-id(key('groups', substring(., 1 + 4*starts-with(., 'The '), 1))[1])] | Show/Title[generate-id() = generate-id(key('groups', substring(., 1 + 4*starts-with(., 'The '), 1))[1])]">
						 <xsl:sort select="substring(., 1 + 4*starts-with(., 'The '), 1)" order="ascending"/>
					</xsl:apply-templates>
				</div>
			</xsl:when>
				<xsl:otherwise>
					<p>No movies or episodes found.</p>
					<input onclick="openSettings()" type="button" value="Go to settings" class="btn-secondary"/>
				</xsl:otherwise>
		</xsl:choose>
   </xsl:template>

   <xsl:template match="Title">
      <xsl:variable name="currentGroup" select="substring(., 1 + 4*starts-with(., 'The '), 1)"/>
      <div style="float: left;">
            <h1><xsl:value-of select="$currentGroup"/></h1>
         <xsl:for-each select="key('groups', $currentGroup)">
			<xsl:sort select="substring(., 1 + 4*starts-with(., 'The '))" order="ascending"/>
			
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
							<img src="{../Poster}" alt="{.}" ></img>
						</xsl:when>
						<xsl:otherwise>
							<img src="" alt="" class="noBoxart" onclick="expandMov(this)"></img>
						</xsl:otherwise>
					</xsl:choose>
					
					<big class="bigAlt"><xsl:value-of select="."/></big>
					<figcaption>

					</figcaption>
					
					</figure>
				</div>
         </xsl:for-each>
      </div>
   </xsl:template>
</xsl:stylesheet>
