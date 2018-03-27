<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:msxsl="urn:schemas-microsoft-com:xslt"
	 xmlns:my="http://whatever"
	>

<!-- <xsl:sort select="substring(Title, 1 + 4*starts-with(translate(Title, $smallcase, $uppercase), 'THE '))"/>  -->

	<xsl:template match="/Movies">
		<xsl:variable name="searchString" select="ShowExpand/@Title"/>
		
		<xsl:choose>
			<xsl:when test="count(Show[Title = $searchString]) > 0">
				<xsl:apply-templates select="Show[Title = $searchString]" />
			</xsl:when>
			<xsl:otherwise>
				<div class="episodeSeasonDiv" name="{$searchString}">
					<p style="color:red;">Error: could not find a show named "<xsl:value-of select="$searchString"/>" in Movie-Data.xml.</p>
				</div>
			</xsl:otherwise>
		</xsl:choose>
   </xsl:template>
   
   <xsl:template match="Show">
			<xsl:variable name="showTitle" select="Title"/>
   
			<xsl:variable name="SortedEpisodesCopy">
				<xsl:for-each select="Episode">
					<xsl:sort select="SeasonNum" data-type="number" order="ascending"/>
					<xsl:sort select="EpisodeNum" data-type="number" order="ascending"/>
					<xsl:copy-of select = "current()"/>
				</xsl:for-each>
			</xsl:variable>
			<xsl:variable name="allEpisodesNodeset" select="msxsl:node-set($SortedEpisodesCopy)"/>
			
			<xsl:variable name="SeasonNums">
				<xsl:for-each select="$allEpisodesNodeset/Episode">
					<xsl:copy-of select = "SeasonNum[not(.=preceding::SeasonNum)]"/>
				</xsl:for-each>
			</xsl:variable>
			<xsl:variable name="SeasonNumsNodeset" select="msxsl:node-set($SeasonNums)"/>
	

			<!-- <xsl:for-each select="$SeasonNumsNodeset/SeasonNum">
				<div class="episodeSeasonDiv" name="{$showTitle}"><h3>Season <xsl:value-of select="."/></h3>
				<ol>
					<xsl:apply-templates select="$allEpisodesNodeset/Episode[SeasonNum=current()]"/>
				</ol>
				</div>
			</xsl:for-each> -->

			<div class="episodeSeasonDiv" name="{$showTitle}">
			<small style="margin-bottom:0em;padding-bottom:0.1em;"><xsl:value-of select="$showTitle"/><xsl:if test="Year != ''"> <!--<small title="{Release}" class="muted"> (<xsl:value-of select="Year"/>)</small>--></xsl:if>:</small>
			
			<h4 style="margin-top:4px;margin-bottom:0em;padding-bottom:0.1em;border-bottom: 1px solid #003300;">Episode name</h4>
			<xsl:if test="Rating != ''">
				<div title="{format-number(VoteCount,'#,###')} votes" style="display:inline-block;border-right:1px solid black;padding:0.3em;">
					<xsl:call-template name="fullStars">
					  <xsl:with-param name="count" select="round(Rating div 20)"/>
					</xsl:call-template>
					<xsl:call-template name="emptyStars">
					  <xsl:with-param name="count" select="5 - round(Rating div 20)"/>
					</xsl:call-template>
				</div>
				<div style="display:inline-block;padding:0.3em;border-right:1px solid black;">
					<xsl:value-of select="Runtime"/>
				</div>
			</xsl:if>
			<div style="display:inline-block;padding:0.3em;">
					<xsl:value-of select="round(10 * 100000 div (1024 * 1024 * 1024)) div 10"/> GB
				</div><br/>
			
			<p>
			<select onchange="selectSeason(this)" class="select-style" season-selector="" >
				<!--<option value="">Select a season</option>-->
				<xsl:for-each select="$SeasonNumsNodeset/SeasonNum">
					
					<option value="{.}">Season <xsl:value-of select="."/></option>
				</xsl:for-each>
			</select>
			
			<xsl:for-each select="$SeasonNumsNodeset/SeasonNum">
				<xsl:variable name="showIfFirst">
					<xsl:if test="position() = 1">display:inline-block;</xsl:if>
					<xsl:if test="not(position() = 1)">display:none;</xsl:if>
				</xsl:variable>
				<select onchange="selectEpisode(this)" style="{$showIfFirst}" class="select-style" data-season="{.}">
					<!--<option value="">Select an episode</option>-->
					<xsl:apply-templates select="$allEpisodesNodeset/Episode[SeasonNum=current()]"/>
				</select>
			</xsl:for-each>
			
			
			</p>
			<input type="button" class="btn btn-play" onclick="playMov(this)" data-filepath="" value="Play"></input> 
			<input type="button" class="btn" data-filepath="" value="Play next"></input> 
			<input type="button" class="btn" onclick="exploreMov(this)" title="" data-filepath="" value="Browse to"></input>
			<input type="button" class="btn btn-danger" onclick="deleteMov(this)" title="" value="Delete"></input>
			</div>
			
			
   </xsl:template>
   
   <xsl:template match="Episode">
					<option value="{EpisodeNum}" data-filepath="{Filepath}" data-title="{Title}">Episode <xsl:value-of select="EpisodeNum"/></option>
   
		<!--<xsl:variable name="lastWatchedClass">
		<xsl:if test="@LastWatched">lastWatchedEpisode</xsl:if>
		</xsl:variable>
		
			<xsl:choose>
				<xsl:when test="Title != ''">
					<li value="{EpisodeNum}" class="{$lastWatchedClass}"><a class="episodeButton {Quality} " onclick="playMov(this)" data-filepath="{Filepath}" title="{Filepath}"><xsl:value-of select="Title"/></a></li>
				</xsl:when>
				<xsl:otherwise>
					<li value="{EpisodeNum}"><a class="episodeButton {Quality} {$lastWatchedClass}" onclick="playMov(this)" data-filepath="{Filepath}" title="{Filepath}">Episode</a></li>
				</xsl:otherwise>
		</xsl:choose>
			
			
			<xsl:if test="(position() mod 7) = 0">
				<xsl:text disable-output-escaping="yes">&lt;/ol&gt;&lt;ol&gt;</xsl:text>
			</xsl:if>-->
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




