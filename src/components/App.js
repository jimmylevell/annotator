import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
  CssBaseline,
  withStyles,
} from '@material-ui/core';

import AppHeader from './appHeader'
import FilesUploadComponent from '../pages/fileUpload'
import DocumentsManager from '../pages/documentsManager'
import DocumentEditor from '../pages/documentEditor'
import DocumentAnnotator from '../pages/documentAnnotator';

const styles = theme => ({
  main: {
    padding: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(0.5),
    },
  },
});

const App = ({ classes }) => (
  <Fragment>
      <CssBaseline />
      <AppHeader />
      <main className={ classes.main }>
        <Route exact path="/" component={ DocumentsManager } />
        <Route exact path="/fileupload" component={ FilesUploadComponent } />
        <Route exact path="/documents" component={ DocumentsManager } />
        <Route exact path="/documents/:id" component={ DocumentAnnotator } />
        <Route exact path="/documents/:id/edit" component={ DocumentEditor } />
      </main>
    </Fragment>
  );
  
  export default withStyles(styles)(App);