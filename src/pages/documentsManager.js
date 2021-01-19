import React, { Component, Fragment } from 'react';
import { withRouter, Link } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Paper,
  TextField,
  IconButton,
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableCell,
  TableRow
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
  searchInput: {
    width: "100%"
  },
  tableHeader: {
    fontWeight: "bold"
  },
  tableRow: {
    textDecoration: "none",
    "&:hover": {
      background: "#efefef"
    },
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

  async deleteDocument(e, document) {
    e.preventDefault()
    if (window.confirm(`Are you sure you want to delete the document "${ document.name }"`)) {
      await this.fetch('delete', `/documents/${ document._id }`);

      if(!this.state.error) {
        this.setState({
          success: "Document deleted successfully"
        })
      }

      this.getDocuments();
    }
  }

  shareDocumentLink(e, document, navigator) {
    e.preventDefault()
    navigator.clipboard.writeText(window.location.origin + "/documents/" + document._id)

    this.setState({
      success: "Copied link to document to clipboard"
    })
  }

  handleSearchChange = evt => {
    this.setState({ 
      query: evt.target.value 
    });
  };

  render() {
    const { classes } = this.props;

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
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="data table">
                <TableHead>
                  <TableRow>
                    <TableCell className={ classes.tableHeader }>Document name</TableCell>
                    <TableCell className={ classes.tableHeader }>Content</TableCell>
                    <TableCell className={ classes.tableHeader }>Updated At</TableCell>
                    <TableCell className={ classes.tableHeader }>Edit</TableCell>
                    <TableCell className={ classes.tableHeader }>Share</TableCell>
                    <TableCell className={ classes.tableHeader }>Remove</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderBy(documents, ['updatedAt', 'name'], ['desc', 'asc']).map(document => (
                    <TableRow key={document._id} className={classes.tableRow} component={Link} to={`/documents/${document._id}/`}>
                      <TableCell component="th" scope="row">{document.name}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>{document.updatedAt}</TableCell>
                      <TableCell component={Link} to={`/documents/${document._id}/edit`} color="inherit">
                        <IconButton >
                          <EditIcon/>
                        </IconButton>
                      </TableCell>
                      <TableCell onClick={(e) => this.shareDocumentLink(e, document, navigator)} color="inherit">
                        <IconButton >
                          <ShareIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell onClick={(e) => this.deleteDocument(e, document)} color="inherit">
                        <IconButton >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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