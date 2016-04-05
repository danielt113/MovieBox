Function PickFolder()
	Dim SA, F
	Set SA = CreateObject("Shell.Application")
	
	Set F = SA.BrowseForFolder(0, "Add a folder containing movies or episodes.", 0, 17)
	
	If (Not F Is Nothing) Then
	  PickFolder = F.Items.Item.path
	End If
	
	Set F = Nothing
	Set SA = Nothing
End Function 