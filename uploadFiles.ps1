Function Upload-DocumentToAnnotator {
    param(
        [string]$csvFile,
        [string]$language,
        [string]$uri
    )

    if($language -eq "English" -or $language -eq "Czech")
    {
        $fields = @{
            'language' = $language
            'document' = Get-Item -path $csvFile
        }

        Invoke-RestMethod -Uri $uri -Method POST -Form $fields
    }
}

Upload-DocumentToAnnotator -csvFile "C:\Users\jimmy\OneDrive\Desktop\transcript_MAN2_annot02.txt" -language "English" -uri "http://localhost:10000/api/documents"