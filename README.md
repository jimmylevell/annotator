# Annotator app
## Scope
Document manager for .txt documents enriching the documents with predefiend annotations. 
The annotations are provided as .csv for each language. During the upload to the document manager the content is parsed and the annotations are insert has html tags. 
In a userfriendly UI the annotators can see the enriched document. Additionally in this view the annotator can change the annotations and save them into the datebase.

## Design
### Frontend
Using react in combination with the material design to create a intuitive UI.

![screenshoot](documentation/screenshot.PNG)

### Backend
Backend API is using node and mongodb as datastore. 

# Development
Backend and frontend are combined in this project but each with individual package.json.     
For the runtime the following env variable can control the application:

    # react dev port
    PORT=11000

    BACKEND_PORT=10000

    REACT_APP_BACKEND_URL="http://localhost:10000"
    REACT_APP_CATPCHA_SITE_KEY="6LcGX-YZAAAAAGodFykzl6VvRuxcg_xbwT4ieAhy"

    # marian DB connection string
    MARIAN_DB_STRING=mongodb://mongoadmin:password@localhost:27017/document-db?authSource=admin

# annotation file location
ANNOTATION_FILE_EN=""
ANNOTATION_FILE_CZ=""

## Available Scripts
In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.