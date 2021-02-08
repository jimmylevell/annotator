<#
    Function to demonstrate the usage of the backend
    Enables the user to directly upload .txt documents to the backend

    Requires PowerShell 7.0, because we are using -Form parameter on the Invoke-RestMethod
#>
Function Upload-DocumentToAnnotator {
    param(
        [Parameter(Mandatory=$true)]
        [string]$txtFile,
        [Parameter(Mandatory=$true)]
        [string]$language,
        [Parameter(Mandatory=$true)]
        [string]$uri
    )

    if($language -eq "English" -or $language -eq "Czech")
    {
        if(Test-Path $txtFile) {
            $fields = @{
                'language' = $language
                'document' = Get-Item -path $txtFile
            }

            Invoke-RestMethod -Uri $uri -Method POST -Form $fields
        } else {
            Write-Error "A none existing txt file has been passed, please provide an existing one"
        }
    } else {
        Write-Error "A non supported language has been provided, please use the supported languages only"
    }
}

Upload-DocumentToAnnotator  -txtFile "C:\Users\jimmy\OneDrive\Desktop\transcript_MAN2_annot02.txt" `
                            -language "English" -uri "https://localhost:10000/annotator/api/documents"