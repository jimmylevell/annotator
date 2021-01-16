import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Box
} from '@material-ui/core';
import { compose } from 'recompose';

import LoadingBar from '../components/loadingBar';
import ErrorSnackbar from '../components/errorSnackbar';
import InfoSnackbar from '../components/infoSnackbar';

const styles = theme => ({
  annotatorView: {
    width: "90%",
    height: "70vh",
    overflowY: "scroll",
    overflowX: "none",
    whiteSpace: "pre-wrap",
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

  handleChange = evt => {
    let document = this.state.document
    document.content = evt.target.value
    
    this.setState({
      document: document
    })
  }

  async handleSaveDocument() {
    await this.fetch('put', '/documents/' + this.state.documentId, this.state.document)
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
            <Box border={1} className={ classes.annotatorView }>
              <Typography> { this.state.document.content }</Typography>
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
      </Fragment>
    );
  }
}

export default compose(
  withRouter,
  withStyles(styles),
)(DocumentAnnotator);