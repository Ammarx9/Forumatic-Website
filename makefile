
#base path for javascript source folder
src = .\src\javascript
utilPath = $(src)\util

#will prepare a junction link folder in the specified path
createDocPath = $(src)\createDocuments\util
createDocLink = if exist $(createDocPath) rmdir $(createDocPath) /q /s && mklink /J $(createDocPath) $(utilPath)

#will prepare a junction link folder in the specified path
courseReportPath = $(src)\courseReport\util
courseReportLink = if exist $(courseReportPath) rmdir $(courseReportPath) /q /s && mklink /J $(courseReportPath) $(utilPath)

#will prepare a junction link folder in the specified path
courseSpecificationPath = $(src)\courseSpecification\util
courseSpecificationLink = if exist $(courseSpecificationPath) rmdir $(courseSpecificationPath) /q /s && mklink /J $(courseSpecificationPath) $(utilPath)

#will prepare a junction link folder in the specified path
indexPath = $(src)\index\util
indexLink = if exist $(indexPath) rmdir $(indexPath) /q /s && mklink /J $(indexPath) $(utilPath)

#will force a hard reset in the working directory to show the actual files,
#then wait for 3 seconds for file system to finish. ignore me.
gitStash = git stash
gitReset = git reset --hard
gitResetHEAD = $(gitStash) && $(gitReset)
timeout = timeout 2

main:
	npm run build

install:
	npm install firebase
	npm install webpack
	npm install firebase-cli -g
	npm install firebase-tools -g

test:
	node ./src/javascript/tableParser.js

unlock:
	powershell Set-ExecutionPolicy Unrestricted -Scope CurrentUser

lock:
	powershell Set-ExecutionPolicy Restricted -Scope CurrentUser

mklink:
	cmd /c $(gitResetHEAD) && $(timeout) && $(courseSpecificationLink) && $(courseReportLink) && $(createDocLink) && $(indexLink)

#this project now utilizes directory junctions (a diffrent form of regulare shortcuts),
#it's basically a "portal" shortcut where it doesn't change your "current" path.
#Virtual path so to speak.