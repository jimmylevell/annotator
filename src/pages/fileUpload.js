import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Button
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { compose } from 'recompose';

import LoadingBar from '../components/loadingBar';
import ErrorSnackbar from '../components/errorSnackbar';
import InfoSnackbar from '../components/infoSnackbar'

const styles = theme => ({
  useCase: {
    marginTop: theme.spacing(2),
    outline: 0,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  },
});

class FileUploadComponent extends Component {
  constructor() {
    super();

    this.state = {      
        loading: true,
        document: '',

        success: null,
        error: null,
      };

      this.onFileChange = this.onFileChange.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.setState({
      loading: false
    })
  }

  async fetch(method, endpoint, body) {
    try {
      this.setState({
        loading: true,
      })

      const response = await fetch(`/api${ endpoint }`, {
        method,
        body: body
      });

      this.setState({
        loading: false
      })

      return await response.json();
    } catch (error) {
      console.error(error);
      this.setState({ 
        error: error 
      });
    }
  }

  onFileChange(evt) {
      this.setState({ document: evt.target.files[0] })
  }

  async onSubmit(evt) {
      evt.preventDefault()
      const formData = new FormData()

      formData.append('document', this.state.document)
      await this.fetch('post', "/documents", formData)

      this.setState({
        document: null
      })

      if(this.state.error === null) {
        this.setState({
          success: "Document uploaded successfully"
        })
      }
  }

  render() {
    const { classes } = this.props;
    return (
      <Fragment>
        <Typography variant="h4">Document upload</Typography>

        <form onSubmit={ this.onSubmit }>
          <label htmlFor="btn-upload">
            <input
              id="btn-upload"
              name="btn-upload"
              style={{ display: 'none' }}
              accept=".txt"
              type="file"
              onChange={ this.onFileChange } 
            />

            <Button
              className="btn-choose"
              variant="outlined"
              component="span" 
            >
              Choose Files
            </Button>
        </label>

        <div className="file-name">
          {this.state.document && this.state.document.name.length > 0 && (
            <Typography>{ this.state.document.name }</Typography>
          )}
        </div>
          
          <Button size="small" 
            color="primary" 
            disabled={ !this.state.document } 
            type="submit"
          >
            <AddIcon/>Upload
          </Button>
        </form>

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
    )
  }
}

export default compose(
    withRouter,
    withStyles(styles),
  )(FileUploadComponent);