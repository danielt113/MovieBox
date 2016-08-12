<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

   <xsl:template match="Movies">
		<xsl:choose>
			<xsl:when test="(count(Show[Episode/@LastWatched]) + count(Movie[@LastWatched])) &gt; 0">
				<div class="TopLevelBoxArt" style="float: left;">
				<h2>Continue watching</h2>
					<xsl:for-each select="Movie[@LastWatched]/Title">
						<xsl:sort select="../@LastWatched" order="descending"/>
						<xsl:if test="position() &lt; '3'">
							<xsl:variable name="MovieOrShow">
										Movie
							</xsl:variable>	
						
							  <div name="{.}" data-filepath="{../Filepath}" class="ContinueWatching {$MovieOrShow} CoverArt {../Quality}">
					
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
						</xsl:if>
					</xsl:for-each>

					<xsl:for-each select="Show[Episode/@LastWatched]/Title">
						<xsl:sort select="../Episode/@LastWatched" order="descending"/>

						<xsl:variable name="MovieOrShow">
									TVShow
						</xsl:variable>	
					
						  <div name="{.}" data-filepath="{../Filepath}" class="ContinueWatching {$MovieOrShow} CoverArt {../Quality}">
				
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
				
				<!--<div class="TopLevelBoxArt" style="float: left;">
				<h2>Recently added</h2>
					<xsl:for-each select="Movie[not(position() >6)]/Title | Show[not(position() >6)]/Title">
						<xsl:sort select="../@AddedOn" order="descending"/>

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
				</div>-->
			</xsl:when>
				<xsl:otherwise>
					<!-- <p>Nothing to continue watching.</p> -->
				</xsl:otherwise>
		</xsl:choose>
   </xsl:template>
</xsl:stylesheet>
