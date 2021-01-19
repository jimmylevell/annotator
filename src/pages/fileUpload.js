import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Button,
  Select,
  InputLabel,
  MenuItem
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
const languages = ["English", "Czech"]

class FileUploadComponent extends Component {
  constructor() {
    super();

    this.state = {      
        document: '',
        language: "English",
        inputFileKey: Date.now(),

        loading: true,
        success: null,
        error: null,
      };

      this.onFileChange = this.onFileChange.bind(this);
      this.handleLanguageChange = this.handleLanguageChange.bind(this)
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
        headers: {
          "Accept": "application/json",
          "type": "formData"
        },
        body: body
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

      return await response.json();
    } catch (error) {
      console.error(error);
      this.setState({ 
        error: error 
      });
    }
  }

  onFileChange(evt) {
      this.setState({ 
        document: evt.target.files[0] 
      })
  }

  handleLanguageChange(evt) {
    this.setState({ language: evt.target.value })
  }

  async onSubmit(evt) {
      evt.preventDefault()
      const formData = new FormData()

      // combine file input and input field
      formData.append('document', this.state.document)
      formData.append('language', this.state.language)

      await this.fetch('post', "/documents", formData)

      this.setState({
        document: null,
        inputFileKey: Date.now()    // reset the input key so that the input field is regenerated (reset)
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
        <form encType="multipart/form-data" onSubmit={ this.onSubmit }>
          <label htmlFor="btn-upload">
            <input
              id="btn-upload"
              key={this.state.inputFileKey}
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

        <InputLabel id="labelInputLanguage">Language</InputLabel>
        <Select
          labelId="labelInputLanguage"
          id="inputLanguage"
          value={this.state.language}
          onChange={this.handleLanguageChange}
          required
        >
          {
            languages.map((language, i) => (
              <MenuItem key={i} value={language}><em>{language}</em></MenuItem>
            ))
          }
        </Select>

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