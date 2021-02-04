import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Button,
  Select,
  InputLabel,
  MenuItem,
  TextField
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { compose } from 'recompose';

import LoadingBar from '../components/loadingBar';
import ErrorSnackbar from '../components/errorSnackbar';
import InfoSnackbar from '../components/infoSnackbar'

const styles = theme => ({
  form: {
    marginTop: theme.spacing(4)
  },
  inputLabel: {
    marginTop: theme.spacing(4),
  },
  textInput: {
    marginTop: theme.spacing(4),
    display: "block"
  }
});
const languages = ["English", "Czech"]      // language definition for dropdown
const REACT_APP_BASE_DIR = process.env.REACT_APP_BASE_DIR || '/'

class FileUploadComponent extends Component {
  constructor() {
    super();

    this.state = {      
        document: '',
        language: "English",
        inputFileKey: Date.now(),         // after the successfull upload of a document we have to reiinitialize the input field

        loading: true,                   // flag for displaying loading bar
        success: null,                   // flag for displaying success messages
        error: null,                   // flag for displaying error messages
      };

      this.onFileChange = this.onFileChange.bind(this);
      this.handleChange = this.handleChange.bind(this)
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

      const response = await fetch(`${ REACT_APP_BASE_DIR }api${ endpoint }`, {
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

  handleChange = (evt) => {
    const target = evt.target
    const name = target.name
    let value = target.value

    this.setState({
      [name]: value
    })
  }

  async onSubmit(evt) {
      evt.preventDefault()
      const formData = new FormData()

      // combine file input and input field
      formData.append('document', this.state.document)
      formData.append('meetingId', this.state.meetingId)
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
        <Typography variant="h4">Document Upload</Typography>
        <form encType="multipart/form-data" className={ classes.form } onSubmit={ this.onSubmit }>
          <label htmlFor="btn-upload">
            <input
              id="btn-upload"
              key={ this.state.inputFileKey }
              name="btn-upload"
              style={ { display: 'none' } }
              accept=".txt"
              type="file"
              onChange={ this.onFileChange } 
            />

            <Button
              color="primary"
              className="btn-choose"
              variant="outlined"
              component="span" 
            >
              Choose Files
            </Button>
        </label>

        <TextField
          required
          key="inputMeetingId"
          name="meetingId"
          label="Meeting id"
          type="text"
          value={ this.state.meetingId }
          onChange={ this.handleChange }
          className={ classes.textInput }
        />

        <InputLabel id="labelInputLanguage" className={ classes.inputLabel }>Language</InputLabel>
        <Select
          labelId="labelInputLanguage"
          id="inputLanguage"
          value={ this.state.language }
          onChange={ this.handleChange }
          required
        >
          {
            languages.map((language, i) => (
              <MenuItem key={ i } value={ language }><em>{ language }</em></MenuItem>
            ))
          }
        </Select>

        <div className="file-name">
          { /* show upload button and filename only if file has been selected*/}
          { this.state.document && this.state.document.name.length > 0 && (
            <Typography className={ classes.inputLabel }>File: { this.state.document.name }</Typography>
          )}
        </div>
          
          <Button
            color="primary" 
            variant="outlined"
            disabled={ !this.state.document } 
            className={ classes.inputLabel }
            type="submit"
          >
            <AddIcon/>Upload
          </Button>
        </form>

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
    )
  }
}

export default compose(
    withRouter,
    withStyles(styles),
  )(FileUploadComponent);