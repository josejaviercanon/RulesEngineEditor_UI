---
description: Stop the ASP.NET Core 10 Web API server
agent: build
---

If the user says stop (or stop the backend), or agent need stop after finish testing:
Kill any dotnet process listening on the backend ports (5064 and 7119):
!``powershell
Get-NetTCPConnection -LocalPort 5064 -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
Get-NetTCPConnection -LocalPort 7119 -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
``
