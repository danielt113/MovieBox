<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!-- <xsl:sort select="substring(Title, 1 + 4*starts-with(., 'The ') + 4*starts-with(., 'the '), 1)"/>  -->

<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'" />
<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />
<xsl:key name="groups" match="Movie/Title | Show/Title" use="substring(., 1 + 4*starts-with(., 'The '), 1)"/>

   <xsl:template match="Movies">
		<xsl:choose>
			<xsl:when test="(count(Show/Episode) + count(Episode)) > 0">
				<xsl:apply-templates select="Movie/Title[generate-id() = generate-id(key('groups', substring(., 1 + 4*starts-with(., 'The '), 1))[1])] | Show/Title[generate-id() = generate-id(key('groups', substring(., 1 + 4*starts-with(., 'The '), 1))[1])]">
					 <xsl:sort select="substring(., 1 + 4*starts-with(., 'The '), 1)" order="ascending"/>
				</xsl:apply-templates>
			</xsl:when>
				<xsl:otherwise>
					<p>No movies or episodes were found.</p>
					<input onclick="openSettings()" type="button" value="Settings" class="btn-secondary"/>
				</xsl:otherwise>
		</xsl:choose>
   </xsl:template>

   <xsl:template match="Title">
      <xsl:variable name="currentGroup" select="substring(., 1 + 4*starts-with(., 'The '), 1)"/>
      <div style="float: left;">
            <h1><xsl:value-of select="$currentGroup"/></h1>
         <xsl:for-each select="key('groups', $currentGroup)">
			<xsl:sort select="substring(., 1 + 4*starts-with(., 'The '))" order="ascending"/>
			
			  <div name="{.}" class="CoverArt {../Quality}" title="{.}">
				
				<figure>
					<xsl:choose>
						<xsl:when test="../Poster!=''">
							<img src="{../Poster}" alt="{.}"></img>
						</xsl:when>
						<xsl:otherwise>
							<img style="font-size:40px;" src="" alt="" class="noBoxart"></img>
						</xsl:otherwise>
					</xsl:choose>
					
					<big class="bigAlt"><xsl:value-of select="."/></big>
					<figcaption>
						<xsl:choose>
							<xsl:when test="name(parent::*)='Movie'">
								<br/>
								<input type="button" class="fadeIn btn-boxart" onclick="playMov(this)" value="Play"></input><span style="display:none"><xsl:value-of select="../Filepath"/></span> <br/>
								<input type="button" class="fadeIn btn-boxart-small-bottom LinkButton" onclick="playTrailer(this)" title="{../Trailer}" value="Trailer"></input><span style="display:none"><xsl:value-of select="../Trailer"/></span> <br/>
								<input type="button" class="fadeIn btn-boxart-small-left" title="{../Filepath}" onclick="exploreMov(this)" value="Browse"></input><span style="display:none"><xsl:value-of select="../Filepath"/></span> <br/>
								<input type="button" class="fadeIn btn-boxart-small-right btn-danger" onclick="deleteMov(this)" value="Delete"></input><span style="display:none"><xsl:value-of select="../Filepath"/></span>
								<!-- ($<xsl:value-of select="format-number(../Budget div 1000000, '###,###')"/>M) -->
								<!-- <b><xsl:value-of select="."/></b> (<xsl:value-of select="../Release"/>) -->
								<!-- <br/><small><i><xsl:value-of select="../@OriginalQuery"/></i></small> -->
							</xsl:when>
							<xsl:otherwise>
								<br/>
								<input type="button" class="fadeIn btn-boxart-gray" onclick="expandShow(this)" value = "Open"></input><span style="display:none"><xsl:value-of select="."/></span> <br/>
							</xsl:otherwise>
						</xsl:choose>
					</figcaption>
					
					</figure>
				</div>
         </xsl:for-each>
      </div>
   </xsl:template>
</xsl:stylesheet>
