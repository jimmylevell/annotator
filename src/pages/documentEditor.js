import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import {
  withStyles,
  Typography,
  TextField,
  Button
} from '@material-ui/core';
import { compose } from 'recompose';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import RefreshIcon from '@material-ui/icons/Refresh';

import LoadingBar from '../components/loadingBar';
import ErrorSnackbar from '../components/errorSnackbar';
import InfoSnackbar from '../components/infoSnackbar';

const REACT_APP_BASE_DIR = process.env.REACT_APP_BASE_DIR || '/'
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL + REACT_APP_BASE_DIR
const styles = theme => ({
  contentInput: {
    width: "90%",
    margin: theme.spacing(1),
    fontSize: "1.2em"
  },
  buttons: {
    margin: theme.spacing(1)
  }
});

class DocumentEditor extends Component {
  constructor() {
    super();

    this.state = {
      documentId: null,
      document: null,

      changed: false,       // flag for initializing automatic save
      success: null,        // flag for displaying success messages
      loading: true,        // flag for displaying loading bar
      error: null,        // flag for displaying error messages
    };

    this.handleSaveDocument = this.handleSaveDocument.bind(this)
    this.handleUpdateAnnotations = this.handleUpdateAnnotations.bind(this)
  }

  componentDidUpdate = () => {
    // automatically save document every 10 secounds when something has been changed 
    let that = this
    setInterval(function(){
      if(that.state.changed) {
        that.handleSaveDocument()
      }
    }, 10000)
  }

  componentDidMount = () => {
    const documentId = this.props.match.params.id;

    // wait till state is fully set, then load usecases
    this.setState({
      documentId: documentId
    }, this.getDocument)
  }

  async fetch(method, endpoint, body) {
    try {
      this.setState({
        loading: true
      })

      let response = await fetch(`${ REACT_APP_BASE_DIR }api${ endpoint }`, {
        method,
        body: JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
        },
      });

      this.setState({
        loading: false
      })

      if(response.ok === false) {
        console.error(response)
        this.setState({
          error: { message: "Error when talking with API. Error message: " + response.statusText}
        })

        return response
      }

      response = await response.json();

      return response.documents
    } catch (error) {
      console.error(error);

      this.setState({ error });
    }
  }

  async getDocument() {
    this.setState({
      document: (await this.fetch('get', '/documents/' + this.state.documentId)) || []
    })
  }

  handleChange = evt => {
    let document = this.state.document
    document.content = evt.target.value
    
    // save changed document and set changed flag
    this.setState({
      changed: true,
      document: document
    })
  }

  async handleSaveDocument() {
    await this.fetch('put', '/documents/' + this.state.documentId, this.state.document)

    if(!this.state.error) {
      // save changed document and set changed flag false
      this.setState({
        changed: false,
        success: "Document saved successfully"
      })
    }
  }

  async handleUpdateAnnotations() {
    await this.fetch('get', '/documents/' + this.state.documentId + "/reannotate")

    if(!this.state.error) {
      this.setState({
        success: "Document reannotation completed successfully"
      })
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        <Typography className={ classes.title } variant="h4">Document Editor</Typography>
        
        {this.state.document !== null ? (
          // document present
          <div>
            <Typography variant="h5"> { this.state.document.name } </Typography>

            <Button 
              size="small" 
              color="primary" 
              onClick={ this.handleSaveDocument }
              className={ classes.buttons }
            >
              <SaveAltIcon/>Save
            </Button>

            <Button 
              href={`${ REACT_APP_BACKEND_URL }api/documents/${ this.state.documentId }/orgDoc/download`}
              size="small" 
              color="primary"
              className={ classes.buttons }
            >
                <CloudDownloadIcon/>Download original document .txt
            </Button>

            <Button 
              size="small" 
              color="primary" 
              onClick={ this.handleUpdateAnnotations }
              className={ classes.buttons }
            >
              <RefreshIcon/>Update annotations
            </Button>

            <TextField
              type="text"
              value={ this.state.document.content }
              onChange={ this.handleChange }
              variant="outlined"
              fullWidth={ true }
              className={ classes.contentInput }
              multiline
              rows={ 20 }
            />
          </div>        
        ) : (
          // no document could be found
          !this.state.loading && (
            <Typography variant="subtitle1">No document with given ID could be found</Typography>
          )
        )}

        { /* Flag based display of error snackbar */ }            
        {this.state.error && (
          <ErrorSnackbar
            onClose={() => this.setState({ error: null })}
            message={ this.state.error.message }
          />
        )}

        { /* Flag based display of loadingbar */ }
        {this.state.loading && (
          <LoadingBar/>
        )}

        { /* Flag based display of info snackbar */ }
        {this.state.success && (
          <InfoSnackbar
            onClose={() => this.setState({ success: null })}
            message={ this.state.success }
          />
        )}
      </Fragment>
    );
  }
}

export default compose(
  withRouter,
  withStyles(styles),
)(DocumentEditor);