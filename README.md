# Annotator app
## Scope
This application is for centrally storing and managing documents. These documents can be automatically enriched with annotations stored in csv files. The csv files are defined per language. You can view and change the created annotations of a document and even add annotations for a document.  
The application further provides an interface for defining the anonymization labels for each annotation. Based on these labels a document can be anonymized using the annotations and the defined anonymized label. 

## Productive Infrastructure
The application consists of a frontend end written in react and a backend written in NodeJS. For the storage of the data mongodb is used.  
The following servers are involved in the productive infrastructure:  
![infrastructure](documentation/infrastructure.PNG)

## Design
### Frontend
Using react in combination with the material design to create a intuitive UI.

In the document upload view the user is able to upload a new .txt document. During the upload of the document a secure and isolated copy of the document is created. Within this secure context the annotations are added. 
![UploadView](documentation/UploadView.PNG)

The uploaded documents can be viewed using the document view. Direct links can be created to a document, the original .txt document can be edited and the annotation view can be accessed.  
![DocumentView](documentation/DocumentView.PNG)

The annotator view is the main work place for the annotators. Using this interface the annotator can add new annotations or can change the status of the existing annotations. Using this workspace it is also possible to save changes, download the annotated document as .xml or as anonymized .txt document. Additionally the extracted people characters e.g (J) can be extracted and defined in this view. 
![AnnotatorView](documentation/AnnotatorView.PNG)

Using the anonymization editor you can view all annotations which are marked as confirmed, either at token or type level. For each of the annotations you can define an anonymized label. THis anonymized label is stored within the annotation and is used for the anonymization process. 
![AnonymizationView](documentation/AnonymizationView.PNG)

The document editor provides direct access to the original .txt content of the imported document. It is important to note that the secure context with the annotations is not automatically synchronized. This has to be manually triggered via the corresponding button. Keep in mind that all previous manually added annotations and anonymization labels are being cleared for the current document through this step.
![DocumentEditorView](documentation/DocumentEditorView.PNG)

### Backend
Backend API is using node and mongodb as datastore. 

# Development
Backend and frontend are combined in this project but each with individual package.json.     
For the runtime the following env variable can control the application:

    # react dev port
    PORT=11000

    BACKEND_PORT=10000

    BASE_DIR=/annotator
    REACT_APP_BASE_DIR=/annotator

    REACT_APP_BACKEND_URL=http://localhost:10000
    REACT_APP_CATPCHA_SITE_KEY=key

    REACT_APP_VERSION=1.0.0
    REACT_APP_NAME=$npm_package_name

    # marian DB connection string
    MARIAN_DB_STRING=mongodb://mongoadmin:password@localhost:27017/document-db?authSource=admin

    # annotation file location
    ANNOTATION_FILE_EN=externalFiles/annotations_en.csv
    ANNOTATION_FILE_CZ=externalFiles/annotations_cz.csv
    ANNOTATOR=AnnotName

# Available Scripts
In the project directory, you can run:

## `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.