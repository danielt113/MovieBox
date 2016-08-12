<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!-- <xsl:sort select="substring(Title, 1 + 4*starts-with(Title, 'The ') + 4*starts-with(Title, 'the '))"/>  -->

	<xsl:template match="/Movies">  
	<div id="backButton" onclick='reSortBy(document.getElementById("cmSort").parentNode.childNodes[0].innerHTML);'>
		<div class="leftArrow"></div> Back</div>
	<xsl:if test="count(Folder[@type='fixed']) &gt; 0">
   <div class="textDiv">
	<h1>Folders</h1>
	<table>
	<thead>
	<tr><th>Path</th><th>Movies</th><th>Depth</th></tr></thead>
	<tbody>
         <xsl:for-each select="Folder[@type='fixed']">
			<tr>
			<td><xsl:value-of select="./Path"/></td>
			<td><xsl:value-of select="./MovieCount"/></td>
			<td><xsl:value-of select="./MaxDepth"/></td>
					</tr>
         </xsl:for-each>
		 </tbody>
		 </table>
		 </div>
	</xsl:if>
	
	<xsl:if test="count(Folder[@type='removable']) &gt; 0">
		 <div class="textDiv">
		 <h1>Removable media</h1>
		 <table>
	<thead>
	<tr><th>Path</th><th>Movies</th><th>Depth</th></tr></thead>
	<tbody>
         <xsl:for-each select="Folder[@type='removable']">
			<tr>
			
			<td><xsl:value-of select="./Path"/> '<xsl:value-of select="./VolumeName"/>'</td>
			<td><xsl:value-of select="./MovieCount"/></td>
			<td><xsl:value-of select="./MaxDepth"/></td>
					</tr>
         </xsl:for-each>
		 </tbody>
		 </table>
		 </div>
		</xsl:if>
   </xsl:template>
</xsl:stylesheet>
