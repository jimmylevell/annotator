import React, { Component, Fragment } from 'react';
import { withRouter, Link } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  IconButton
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import ShareIcon from '@material-ui/icons/Share';
import EditIcon from '@material-ui/icons/Edit';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { orderBy, filter } from 'lodash';
import { compose } from 'recompose';

import LoadingBar from '../components/loadingBar';
import InfoSnackbar from '../components/infoSnackbar';
import ErrorSnackbar from '../components/errorSnackbar';

const MAX_LENGTH = 100
const styles = theme => ({
  documentsView: {
    whiteSpace: "inherit",
  },
  linkStyle: {
    color: 'black'
  },
  searchInput: {
    width: "100%"
  }
});

class DocumentsManager extends Component {
  constructor() {
    super();

    this.state = {
      loading: true,
      query: "",
      documents: "",

      success: null,
      error: null,
    };
  }

  componentDidMount() {
    this.getDocuments();
  }

  async fetch(method, endpoint, body) {
    try {
      this.setState({
        loading: true
      })

      let response = await fetch(`/api${ endpoint }`, {
        method,
        body: body,
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

  async getDocuments() {
    let documents = await this.fetch('get', '/documents')

    this.setState({ 
      loading: false, 
      documents: documents || [] 
    });
  }

  async deleteDocument(document) {
    if (window.confirm(`Are you sure you want to delete "${ document.name }"`)) {
      await this.fetch('delete', `/documents/${ document._id }`);

      if(!this.state.error) {
        this.setState({
          success: "document deleted successfully"
        })
      }

      this.getDocuments();
    }
  }

  shareDocumentLink(document) {
    navigator.clipboard.writeText(window.location.origin + "/documents/" + document._id)

    this.setState({
      success: "Copied link to document in clipboard"
    })
  }

  handleSearchChange = evt => {
    this.setState({ 
      query: evt.target.value 
    });
  };

  render() {
    const { classes } = this.props;
    const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL

    let that = this
    let documents = filter(this.state.documents, function(obj) {
      return obj.name.toUpperCase().includes(that.state.query.toUpperCase());
    })
    
    return (
      <Fragment>
        <TextField
          type="text"
          key="inputQuery"
          placeholder="Search"
          label="Search"
          className={classes.searchInput}
          value={this.state.query}
          onChange={this.handleSearchChange}
          variant="outlined"
          size="small"
          autoFocus 
        />

        <Typography variant="h4">Documents</Typography>
        
        {this.state.documents.length > 0 ? (
          // documents available
          <Paper elevation={1} className={ classes.documentsView }>
            <List>
              {orderBy(documents, ['updatedAt', 'name'], ['desc', 'asc']).map(document => (
                <ListItem key={ document._id }  button component={ Link } to={ `/documents/${document._id}` }>
                  <ListItemText
                    primary={ document.name }
                  />

                  <ListItemText>
                    { document.content.length > MAX_LENGTH ? (
                    <div>
                        {`${ document.content.substring(0, MAX_LENGTH) }...` }
                    </div>
                    ) : (
                    <div>
                        { document.content }
                    </div>
                    )
                    }
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <IconButton>
                      <a href={`${ REACT_APP_BACKEND_URL }/api/documents/${document._id}/download`} className={classes.linkStyle}>
                        <SaveAltIcon />
                      </a>
                    </IconButton>
                    <IconButton component={Link} to={`/documents/${document._id}/edit`} color="inherit">
                      <EditIcon/>
                    </IconButton>
                    <IconButton onClick={() => this.shareDocumentLink(document, navigator)} color="inherit">
                      <ShareIcon />
                    </IconButton>
                    <IconButton onClick={() => this.deleteDocument(document)} color="inherit">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          // no documents available
          !this.state.loading && (
            <Typography variant="subtitle1">So far no documents have been created</Typography>
          )
        )}
  
        {this.state.error && (
          <ErrorSnackbar
            onClose={() => this.setState({ error: null })}
            message={this.state.error.message}
          />
        )}

        {this.state.loading && (
          <LoadingBar/>
        )}

        {this.state.success && (
          <InfoSnackbar
            onClose={() => this.setState({ success: null })}
            message={this.state.success}
          />
        )}
      </Fragment>
    );
  }
}

export default compose(
  withRouter,
  withStyles(styles),
)(DocumentsManager);