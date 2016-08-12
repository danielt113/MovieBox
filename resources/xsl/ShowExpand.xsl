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
	

			<xsl:for-each select="$SeasonNumsNodeset/SeasonNum">
				<div class="episodeSeasonDiv" name="{$showTitle}"><h3>Season <xsl:value-of select="."/></h3>
				<ol>
					<xsl:apply-templates select="$allEpisodesNodeset/Episode[SeasonNum=current()]"/>
				</ol>
				</div>
			</xsl:for-each>
			
   </xsl:template>
   
   <xsl:template match="Episode">
		<xsl:variable name="lastWatchedClass">
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
			</xsl:if>
   </xsl:template>
</xsl:stylesheet>



