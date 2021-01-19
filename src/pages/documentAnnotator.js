import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Button,
  Box
} from '@material-ui/core';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { compose } from 'recompose';
import Parser from 'html-react-parser';

import LoadingBar from '../components/loadingBar';
import ErrorSnackbar from '../components/errorSnackbar';
import InfoSnackbar from '../components/infoSnackbar';

import './documentAnnotator.css'

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const styles = theme => ({
  annotatorView: {
    width: "90%",
    height: "55vh",
    overflowY: "scroll",
    overflowX: "none",
    whiteSpace: "pre-wrap",
    margin: theme.spacing(1),
    fontSize: "1.2em"
  },
  buttons: {
    margin: theme.spacing(1)
  }
});

class DocumentAnnotator extends Component {
  constructor() {
    super();

    this.state = {
      documentId: null,
      document: null,

      success: null,
      loading: true,
      error: null,
    };

    this.myRef = React.createRef();

    this.handleSaveDocument = this.handleSaveDocument.bind(this)
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

      let response = await fetch(`/api${ endpoint }`, {
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

  async handleSaveDocument() {
    await this.fetch('put', '/documents/' + this.state.documentId, this.state.document)

    if(this.state.error === null) {
      this.setState({
        success: "Document saved successfully"
      })
    }
  }

  handleClick = (event, data) => {
    let doc = this.state.document 
    let tagName = data.target.getAttribute("name")
    let tagDecision = data.target.getAttribute("decision")
    
    if(tagDecision !== "yes") {
      document.getElementsByName(tagName).forEach(node => {
        node.setAttribute("decision", data.action)
      })

      doc.annotated_content = this.myRef.current.innerHTML
      
      this.setState({
        document: doc
      })
    } else {
      this.setState({
        error: { message: "You are not allowed to change yes annotations" }
      })
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <Fragment>    
        <Typography className={ classes.title } variant="h4">Document Annotator </Typography>
        
        {this.state.document !== null ? (
          // document present
          <div>
            <Typography variant="h5"> { this.state.document.name } </Typography>
            <Button 
              size="small" 
              color="primary" 
              onClick={ this.handleSaveDocument }>
                <SaveAltIcon/>Save
              </Button>

              <Button 
                href={`${ REACT_APP_BACKEND_URL }/api/documents/${this.state.documentId}/annotatedDoc/download`}
                size="small" 
                color="primary"
                className={classes.buttons}
              >
                <CloudDownloadIcon/>Download annotated document
              </Button>
            
            <Box border={1} className={ classes.annotatorView }>
              <ContextMenuTrigger id="contextMenu">
                <div ref={this.myRef}>{ Parser(this.state.document.annotated_content) }</div>
              </ContextMenuTrigger>
            </Box>
          </div>        
        ) : (
          // no document could be found
          !this.state.loading && (
            <Typography variant="subtitle1">No document with given ID could be found</Typography>
          )
        )}

        {this.state.error && (
          <ErrorSnackbar
            onClose={() => this.setState({ error: null })}
            message={ this.state.error.message }
          />
        )}

        {this.state.loading && (
          <LoadingBar/>
        )}

        {this.state.success && (
          <InfoSnackbar
            onClose={() => this.setState({ success: null })}
            message={ this.state.success }
          />
        )}

        <ContextMenu id="contextMenu">
          <MenuItem
            data={{ action: 'yes' }}
            onClick={this.handleClick}
          >
            yes
          </MenuItem>
          <MenuItem
            data={{ action: 'no' }}
            onClick={this.handleClick}
          >
            no
          </MenuItem>
        </ContextMenu>

      </Fragment>
    );
  }
}

export default compose(
  withRouter,
  withStyles(styles),
)(DocumentAnnotator);