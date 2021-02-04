Function Upload-DocumentToAnnotator {
    param(
        [string]$txtFile,
        [string]$language,
        [string]$uri
    )

    if($language -eq "English" -or $language -eq "Czech")
    {
        $fields = @{
            'language' = $language
            'document' = Get-Item -path $txtFile
        }

        Invoke-RestMethod -Uri $uri -Method POST -Form $fields
    }
}

Upload-DocumentToAnnotator  -txtFile "C:\Users\jimmy\OneDrive\Desktop\transcript_MAN2_annot02.txt" `
                            -language "English" -uri "https://localhost:10000/annotator/api/documents"