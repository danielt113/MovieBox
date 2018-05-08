<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:msxsl="urn:schemas-microsoft-com:xslt"
	 xmlns:my="http://whatever"
	>

<!-- <xsl:sort select="substring(Title, 1 + 4*starts-with(translate(Title, $smallcase, $uppercase), 'THE '))"/>  -->

	<xsl:template match="/Movies">
		<xsl:variable name="searchString" select="MovieExpand/@Filepath"/>
		
		<xsl:choose>
			<xsl:when test="count(Movie[Filepath = $searchString]) > 0">
				 <xsl:apply-templates select="Movie[Filepath = $searchString]" />
			</xsl:when>
				<xsl:otherwise>
					<div class="episodeSeasonDiv" name="{$searchString}">
						<p style="color:red;">Error: could not find movie file "<xsl:value-of select="$searchString"/>" in Movie-Data.xml.</p>
					</div>
				</xsl:otherwise>
		</xsl:choose>
	
		
		
   </xsl:template>
   
   <xsl:template match="Movie">

		<div class="episodeSeasonDiv" name="{Filepath}">
			<h3 style="margin-bottom:0em;padding-bottom:0.1em;"><xsl:value-of select="Title"/><xsl:if test="Year != ''"> <small title="{Release}" class="muted"> (<xsl:value-of select="Year"/>)</small></xsl:if></h3>
			<!-- Rating -->
			<xsl:if test="Rating != ''">
				<div title="{format-number(VoteCount,'#,###')} votes" style="display:inline-block;border-right:1px solid black;padding:0.3em;">
					<xsl:call-template name="fullStars">
					  <xsl:with-param name="count" select="round(Rating div 20)"/>
					</xsl:call-template>
					<xsl:call-template name="emptyStars">
					  <xsl:with-param name="count" select="5 - round(Rating div 20)"/>
					</xsl:call-template>
				</div>
				<xsl:if test="Runtime != ''">
					<div style="display:inline-block;padding:0.3em;border-right:1px solid black;">
						<xsl:value-of select="Runtime"/> min.
					</div>
				</xsl:if>
			</xsl:if>
			<div style="display:inline-block;padding:0.3em;">
					<xsl:value-of select="round(10 * Size div (1024 * 1024 * 1024)) div 10"/> GB
				</div><br/>
			
			<input type="button" class="btn btn-play" onclick="playMov(this)" data-filepath="{Filepath}" value="Play"></input> 
			<input type="button" class="btn" onclick="startParty(this)" title="Get a party code to watch this movie with your friends" data-filepath="{Filepath}" value="Start party"></input>
			<input data-filepath="{Filepath}"  onkeyup="joinPartyA(this, event)"  style='font-size: 18px;color:grey' placeholder="Join party" size="8" id="partyID" type="text" value="" class="btn-secondary" ></input>
			
			<br/>
			<br/>
			<br/>
			<xsl:if test="Trailer != '' and Trailer != 'https://www.youtube.com/watch?v=undefined'"><input type="button" class="btn LinkButton" onclick="playTrailer(this)" title="{Trailer}" value="Trailer"></input></xsl:if>
			<input type="button" class="btn" onclick="exploreMov(this)" title="{Filepath}" data-filepath="{Filepath}" value="Browse to"></input>
			<input type="button" class="btn btn-danger" onclick="deleteMov(this)" title="{Filepath}" value="Delete"></input>
			<br/>
			
						
			<!--<p><strong>Budget:</strong> $<xsl:value-of select="format-number(Budget,'#,###')"/></p>-->
			<p title="{Synopsis}"><small><xsl:value-of select="Tagline"/></small></p>
			<!--<div style="" id="fos"><small title="{Synopsis}"><xsl:value-of select="Synopsis"/></small></div>-->
			
			<input type="button" class="btn btn-warning ForContinueWatching" onclick="dismissMov(this)" data-filepath="{Filepath}" value="Done watching"></input>
		</div>
			
   </xsl:template>
   
    <xsl:template name="fullStars">
  
      <xsl:param name="count" select="1"/>

      <xsl:if test="$count > 0">
        <xsl:text>&#9733;</xsl:text>
        <xsl:call-template name="fullStars">
          <xsl:with-param name="count" select="$count - 1"/>
        </xsl:call-template>
      </xsl:if>
      
  </xsl:template>
  
  <xsl:template name="emptyStars">
  
      <xsl:param name="count" select="1"/>

      <xsl:if test="$count > 0">
        <xsl:text>&#9734;</xsl:text>
        <xsl:call-template name="emptyStars">
          <xsl:with-param name="count" select="$count - 1"/>
        </xsl:call-template>
      </xsl:if>
      
  </xsl:template>

</xsl:stylesheet>




