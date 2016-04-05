<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:msxsl="urn:schemas-microsoft-com:xslt"
	 xmlns:my="http://whatever"
	>

<!-- <xsl:sort select="substring(Title, 1 + 4*starts-with(translate(Title, $smallcase, $uppercase), 'THE '))"/>  -->

	<xsl:template match="/Movies">
		<xsl:variable name="searchString" select="ShowExpand/@Title"/>
		<xsl:apply-templates select="Show[contains(Title, $searchString)]" />
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
					<xsl:copy-of select = "SeasonNum[not(.=preceding::*)]"/>
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
			<li value="{EpisodeNum}"><div class="episodeButton {Quality}" onclick="playMov(this)" title="{Filepath}"><a class="{Quality}"></a><xsl:value-of select="Title"/></div><span style="display:none"><xsl:value-of select="Filepath"/></span></li>
			
			<xsl:if test="(position() mod 8) = 0">
				<xsl:text disable-output-escaping="yes">&lt;/ol&gt;&lt;ol&gt;</xsl:text>
			</xsl:if>
   </xsl:template>
   
   
   <!--
   
   <xsl:template match="Episode">
		<xsl:for-each select="$allEpisodesNodeset/Episode">
			<xsl:if test="not(current()/SeasonNum=preceding-sibling::Episode/SeasonNum)">
				<xsl:text disable-output-escaping="yes">&lt;div class="episodeSeasonDiv"&gt;</xsl:text><h3>Season <xsl:value-of select="SeasonNum"/></h3><xsl:text disable-output-escaping="yes">&lt;ol&gt;</xsl:text>
			</xsl:if>
			
			<xsl:if test="(position() mod 10) = 0">
				<xsl:text disable-output-escaping="yes">&lt;/ol&gt;&lt;ol&gt;</xsl:text>
			</xsl:if>
			
			<xsl:variable name="epNum" select="EpisodeNum"/>
			<li value="{$epNum}"><div class="episodeButton {Quality}" onclick="playMov(this)" title="{Filepath}"><a class="{Quality}"></a><xsl:value-of select="Title"/></div><span style="display:none"><xsl:value-of select="Filepath"/></span></li>
			
			<xsl:if test="not(current()/SeasonNum=following-sibling::Episode/SeasonNum)">
				<xsl:text disable-output-escaping="yes">&lt;/ol&gt;&lt;/div&gt;</xsl:text>
			</xsl:if>
		</xsl:for-each>
   </xsl:template>
   
   <xsl:for-each select="Show[contains(Title, $searchString)]">
			
			<xsl:variable name="SortedEpisodesCopy">
				<xsl:for-each select="Episode">
					<xsl:sort select="SeasonNum" data-type="number" order="ascending"/>
					<xsl:sort select="EpisodeNum" data-type="number" order="ascending"/>
					<xsl:copy-of select = "current()"/>
				</xsl:for-each>
			</xsl:variable>
	
			<xsl:variable name="allEpisodesNodeset" select="msxsl:node-set($SortedEpisodesCopy)"/>
	
			<div>
			<xsl:for-each select="$allEpisodesNodeset/Episode">
				<xsl:if test="not(current()/SeasonNum=preceding-sibling::Episode/SeasonNum)">
					<xsl:text disable-output-escaping="yes">&lt;div class="episodeSeasonDiv"&gt;</xsl:text><h3>Season <xsl:value-of select="SeasonNum"/></h3><xsl:text disable-output-escaping="yes">&lt;ol&gt;</xsl:text>
				</xsl:if>
				
				<xsl:if test="(position() mod 11) = 0">
					<xsl:text disable-output-escaping="yes">&lt;/ol&gt;&lt;ol&gt;</xsl:text>
				</xsl:if>
				
				<xsl:variable name="epNum" select="EpisodeNum"/>
				<li value="{$epNum}"><div class="episodeButton {Quality}" onclick="playMov(this)" title="{Filepath}"><a class="{Quality}"></a><xsl:value-of select="Title"/></div><span style="display:none"><xsl:value-of select="Filepath"/></span></li>
				
				<xsl:if test="not(current()/SeasonNum=following-sibling::Episode/SeasonNum)">
					<xsl:text disable-output-escaping="yes">&lt;/ol&gt;&lt;/div&gt;</xsl:text>
				</xsl:if>
			</xsl:for-each>
			</div>
		
	</xsl:for-each>
	
	-->
    

</xsl:stylesheet>




