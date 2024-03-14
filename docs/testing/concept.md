---
title: "Concept"
date: 2022-08-16T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/testing
geekdocFilePath: concept.md
---



## Typical paths through the web ui

### Context: school
- class 6b with 20 pupils:
  - Mona Wieloch (mona.wieloch@mac.com)
  - Jan Hecker-Stahr (jan.hs@att.net)
  - Tobias Seifert (tbsbdr@optonline.net)
  - Birgit Rogge (thaljef@gmail.com)
  - Otfried Seifert-Berger (danneng@aol.com)
  - Hannes Stey-Schuchhardt (earmstro@yahoo.com)
  - Patrick Riehl (sumdumass@verizon.net)
  - Mariele Geißler (gfody@att.net)
  - Klaus-Jürgen Kühnert (kjk@optonline.net)
  - Angelique Patberg (peoplesr@att.net)
  - Elenore Martin (flavell@me.com)
  - Anneliese Fröhlich (balchen@verizon.net)
  - Marina Röhricht-Reising (mpiotr@aol.com)
  - Alwina Bärer (pgolle@aol.com)
  - Britta Klotz (jonathan@me.com)
  - Uli Bolander (jaarnial@outlook.com)
  - Lisbeth Säuberlich (warrior@icloud.com)
  - Christa Ladeck (bancboy@outlook.com)
  - Joseph Heinz-Renner (draper@verizon.net)
  - Björn Fröhlich (evans@mac.com)
  - Oscar Kreusel (ovprit@verizon.net)
  - Kira Köster (maneesh@aol.com)
  - Jozef Jungfer (duncand@gmail.com)
  - Cristina Reising (chaikin@hotmail.com)
  - Benedikt Junitz (monopole@icloud.com)
- each pupil has an ipad as personal device
- gymnasium
- project space "6b"
  - with space members: 20 pupils (viewer) and 8 teachers (Hannes is manager, others are editors)

#### journey 1: teacher prepares next day

##### background
- teacher "Hannes"
- Hannes prepares homework worksheet for biology lesson
- topic: reproduction and development of mammals (example: cats)
- folder structure of Hannes personal space contains folders
  - "/biology/grade 6/mammals"
  - "/grading/2022/6b"
- project space "6b"
  - with folder "/biology"
  
##### scenario (link sharing, working with documents)
As "Helmut" (teacher with admin role)
- creates project space "6b"
- invites "Hannes" as manager

As "Hannes" (teacher, preparation phase of scenario)
- navigates into project space
- creates folder structure a,b,c
- uploads space cover image + set description
- invite other teachers (managers) and pupils (viewers)

As "Hannes" (teacher)
- navigates into "/biology/grade 6/mammals"
- creates and opens word document for collection of ideas
- fills document with text and sketches
- creates handout with local application + uploads files into current folder (wscdoc and pdf)
- copies handout.pdf to project space "6b" into path "/biology/cats/"
- copies internal link to clipboard
- uses chat to share internal link with pupils
- navigates into personal space folder "/grading/2022/6b"
- creates folder "mammals"
- copies public link with "Uploader" role to clipboard
- uses chat to share drop folder link with pupils (for filled out worksheets)

As "Ronja" (pupil)
- receives internal link from Hannes in chat
- downloads pdf, fills it out locally
- clicks on drop folder link and uploads edited worksheet
- navigates into personal space, folder "/Homework"
- uploads filled out pdf
- creates public link and sends it to whole class (WhatsApp group chat) 

As "Friedrich" (pupil)
- receives internal link from Hannes in chat
- opens pdf via left click on file (-> pdf-viewer)
- receives public link from Ronja
- opens Ronja's pdf via left click on file (-> pdf-viewer)
- changes value in "Name" field to his own name
- downloads changed document
- clicks on drop folder link and uploads edited worksheet
- uploads edited worksheet a second time, accidentally

As "Hannes" (teacher)
- navigates into "/grading/2022/6b/mammals"
- checks who uploaded their homework (takes notes with pen&paper)
- opens spreadsheet "/grading/2022/6b/homework.xlsx"
- notes down names of pupils who didn't upload their homework

##### covered workflows / actions
- folder navigation
- view navigation (personal, project space overview, individual project space)
- folder creation
- file upload
- file download
- internal link
- drop link
- open file in pdf-viewer
- download in pdf-viewer
- open document file (onlyoffice)
- (fill content into document file)
- open spreadsheet file (onlyoffice)
- (fill content into spreadsheet file)

#### journey 2: report absence of pupils (user/group sharing)

##### background
- secretary "Ulrike"
- substitute secretary "Thomas"
- teacher "Hannes"
- child "Anneliese"

##### scenario
As "Ulrike" (secretary)
- navigates into personal space
- creates folder "/Orga"
- navigates into "/Orga"
- creates file "/Orga/Absence.xlsx"
- shares file "/Orga/Absence.xlsx" with group "teachers" as viewer
- shares file "/Orga/Absence.xlsx" with user "Thomas" as editor
- creates quick link with role "Internal"
- sends quick link to teachers via email

As "Thomas" (substitute secretary)
- navigates to "Shared with me"
- accepts share "Absence.xlsx"
- receives a call from a parent that their daughter "Anneliese", class 6b, is sick today
- opens file "Absence.xlsx" and adds child as being sick today

As "Hannes" (teacher)
- wonders why child "Anneliese" didn't show up in class today
- navigates to "Shared with me"
- accepts share "Absence.xlsx"
- opens file "Absence.xlsx" and sees that "Anneliese" was reported sick today

##### covered workflows / actions
- navigation into personal space
- folder creation
- folder navigation
- file creation (spreadsheet, onlyoffice)
- file editing (spreadsheet, onlyoffice)
- group share (viewer role)
- user share (editor role)
- accepting shares
- quick link (internal role)

#### journey 3: teacher "Hannes" prepares project space for his class 6b (project spaces)

##### background
- teacher "Hannes"

##### scenario
As "Helmut" (teacher with admin role)
- invites "Hannes" as manager for project space "5b"

As "Hannes" (teacher)
- navigates into project space "5b"
- changes space title to "6b"
- changes subtitle to "room 217"
- changes description to "xyz"
- uploads cover image "xyz" (picture of the class)
- cuts all files & folders in project space (file clipboard)
- creates folder "/archive/5c"
- navigates into folder "/archive/5c"
- clicks "paste here"
- navigates into folder "/archive"
- renames folder "5c" to "5b"
- removes members a, b
- adds member c

##### covered workflows / actions
- spaces actions
  - invite member
  - change title
  - change subtitle
  - change description
  - upload cover image
- cut & paste files & folders
- rename folder

### other possible workflows / actions
- rename share
- delete
- resharing?
- preview app (which actions?)
- text-editor app (which actions?)


### other possible journeys:
- parent-teacher conference (focus on documents)
- class trip (focus on coordination and photos)
- open day (focus on assignment of helping hands and schedule of the day)
