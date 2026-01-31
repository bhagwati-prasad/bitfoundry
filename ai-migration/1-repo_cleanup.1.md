```
I want to create a frontend application (using HTML5, Vanilla JS with d3.js and CSS3) which can help me make sense of all the github repositories of an account. I want to be able to annotate and tag (with some metadata) the repositories. Although, I am starting with making sense of github repos, but I want the app to be generic, I want to be able to plug some data and make sense of it. It may need to connect to some other service, fetch data from there, map it to data which the app understands and populate the UI.

1. According to responsibility, everything feature should be modular (especially JS). It should be in plug and play manner, with well defined API of each module. For example storage module, which may have different channels like local storage, session storage, IndexDB or remote API.
2. The UX may be in different modes. The user can switch between them during the entire workflow. First mode could be traditional lists, tables (made using flex and grid) and forms. The second mode could show them like directory and file access on a computer where user make updates to "dir" or "file" metadata by clicking on some edit icon, there could be a directory tree like navigation for this view. Third mode could be a Tree (like organisation chart) like view which user can click and drill-down into it's component.
3. The data for UX should exist entirely in JSON or Entirely in HTML (both formats should be interchangeable).
4. The user would add notes and other metadata (maybe some flag) and store the information.
5. After requesting data from the remote (maybe some server or github or gitlab) it should be able to work offline (do necessary things like switching storage to local storage etc.). There should be work mode module which can be switched to offline or online. Going back online should sync data with remote, if required, and do other tasks.


Important considerations
1. Make the app generic which could represent data from code versioning apps like github or bitbucket, or some other service which has entirely different data, but has similar code organisation. Best approach would be to create a data structure which represents the way data is being stored in github. A data structure which holds entities like (organisations, collaborators, repositories etc.) and their interactions with ACL
2. The data representation should be very well defined so that it's easy to switch between UX modes, there should be one to one mapping of entities and interactions in one mode with entities and interactions in another mode. These mappings should be stored in a data structure (or interface) as well. So that creating a new UX flow or UX mode is easy.


Task
Create architecture of such an application. Create an exhaustive list of modules and their APIs. Create a folder structure for the app.


Ask questions to understand it better and fill in gaps so that the app gets to be production ready as soon as possible.
```