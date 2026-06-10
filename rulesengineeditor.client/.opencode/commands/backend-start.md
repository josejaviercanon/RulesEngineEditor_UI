---
description: Start the ASP.NET Core 10 Web API server
agent: build
---
If the user says start (or start the backend), or agent need start for testing:
Start the server in the background using the HTTP profile (port 5064). This matches the Vite dev proxy target:
!``powershell
Start-Process -NoNewWindow -FilePath "dotnet" -ArgumentList "run --project ../../BE/RulesEngineEditor.Server --launch-profile http" -RedirectStandardOutput server.log -RedirectStandardError server_error.log
``

If the user says start with https, or agent need start for testing :
Start the server in the background using the HTTPS profile (port 7119 with SSL):
!``powershell
Start-Process -NoNewWindow -FilePath "dotnet" -ArgumentList "run --project ../../BE/RulesEngineEditor.Server --launch-profile https" -RedirectStandardOutput server.log -RedirectStandardError server_error.log
``
