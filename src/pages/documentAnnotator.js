import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Button,
  Box,
  TextField,
} from '@material-ui/core';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import DescriptionIcon from '@material-ui/icons/Description';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { compose } from 'recompose';

import LoadingBar from '../components/loadingBar';
import ErrorSnackbar from '../components/errorSnackbar';
import InfoSnackbar from '../components/infoSnackbar';

import './documentAnnotator.css'

const REACT_APP_BASE_DIR = process.env.REACT_APP_BASE_DIR || '/'
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL + REACT_APP_BASE_DIR
const styles = theme => ({
  annotatorView: {
    width: "89%",
    height: "55vh",
    overflowY: "scroll",
    overflowX: "none",
    whiteSpace: "pre-wrap",
    margin: theme.spacing(1),

    fontSize: "1.2em"
  },
  annotatorViewAction: {
    width: "10%",
    float: "left",
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
      counter: 0,             // counter used for clicking through named tags
      selection: null,        // saved selection of marked content, used for adding new name tags
      annotator: "",          // annotator name

      changed: false,         // flag for indication of changes of the document
      success: null,          // flag to trigger success info
      loading: true,          // flag to trigger loading
      error: null,            // flag to trigger error messages
    };

    // reference to the annoator html view (where changes are beeing made)
    this.annotatorView = React.createRef();

    this.handleSaveDocument = this.handleSaveDocument.bind(this)
    this.handleNextAnnotation = this.handleNextAnnotation.bind(this)
  }

  componentDidUpdate = () => {
    // automatically save document every 10 secounds when changes have happend
    let that = this
    setTimeout(function(){
      if(that.state.changed) {
        that.handleSaveDocument()
      }
    }, 10000)
  }  

  componentDidMount = () => {
    const documentId = this.props.match.params.id;

    // wait till state is fully set, then load usecases
    this.setState({
      documentId: documentId,
      annotator: localStorage.getItem("person")
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

  async handleSaveDocument() {
    let document = this.state.document
    let annotator = this.state.annotator

    // add annotators name to the list of annotators if not already present
    if(document.annotators && Array.isArray(document.annotators) && !document.annotators.includes(annotator)) {
      document.annotators.push(annotator)
    }

    await this.fetch('put', '/documents/' + this.state.documentId, document)

    if(this.state.error === null) {
      // update document and set changed to false, because document saved successfully
      this.setState({
        changed: false,
        document: document,
        success: "Document saved successfully"
      })
    }
  }

  // function which is triggered by the context menu and handles their action
  handleClick = (event, data) => {
    let doc = this.state.document 
    let tag = data.target
    let tagName = tag.nodeName
    let tagStatus = ""

    // only do something if it is a named tag
    if(tagName === "NE") {
      if(data.action === "yes") {
        tagStatus = "confirmed-at-token-level"
      } else if (data.action === "no") {
        tagStatus = "disproved-at-token-level"
      } else if (data.action === "delete") {
        if(data.target.getAttribute("status") === "new") {
          // only allow delete action if it is a "new"ly added tag
          data.target.replaceWith(data.target.innerText)
        }
      }

      // set status and annotator of new named tag
      tag.setAttribute("status", tagStatus)
      tag.setAttribute("annotator", this.state.annotator)

      // updated view and then the state
      doc.annotated_content = this.annotatorView.current.innerHTML
      
      this.setState({
        changed: true,
        document: doc
      })
    } else {
      this.setState({
        error: { message: "Only possible to click on highlighted tokens. To add a new token simply mark the section. As soon as it is highlighted it can be annotated."}
      })
    }
  }

  // to iterate through the annotations
  handleNextAnnotation = (count) => {
    const HIGHTLIGHT_TIMEOUT = 3000
    const VIEW_CORRECTION = -100
    let counter = this.state.counter

    // check if html document is present
    if(document) {
      let namedTags = document.getElementsByTagName("NE")

      // you can only iterate on NE tags and counter cannot be negative
      if(namedTags.length > 0 && ((counter === 0 && count > 0) || (counter > 0))) {

        // updtae counter and then jump to named tag
        this.setState({
          counter: counter + count
        }, () => {

          // scroll to view, highlight tag and correct the view a little but so that actionbar is still visible
          namedTags[counter].scrollIntoView({behaviour: "smooth"}) 
          window.scrollBy(0, VIEW_CORRECTION);
          namedTags[counter].classList.add("highlight")

          // remove the additionally added highlight after some secounds
          setTimeout(function(){
            if(namedTags[counter]) {
              namedTags[counter].classList.remove('highlight')
            }
          }, HIGHTLIGHT_TIMEOUT)
        })
      }
    }
  }

  // function which is triggered when somebody does a selection in the div
  handleSelection = (evt) => {
    // check if selection is present and guarantee that it does not involve already existing named tag
    if (window.getSelection && evt.target.tagName !== "NE") {
        var selection = window.getSelection()

        if (selection.rangeCount) {
          let range = selection.getRangeAt(0).cloneRange()

          // selection cannot be zero
          if(range.startOffset !== range.endOffset) {
            let nameTagElement = document.createElement("NE");
            nameTagElement.setAttribute("status", "new")
            nameTagElement.setAttribute("annotator", this.state.annotator)
            nameTagElement.setAttribute("id", document.getElementsByTagName("NE").length)
            
            // try if we can add the new named tag, if we cannot it is most likely that it overlaps existing named tags
            try {
              range.surroundContents(nameTagElement)
              selection.removeAllRanges()
              selection.addRange(range)

              // as soon as selection has been added update state
              let document = this.state.document
              document.annotated_content = this.annotatorView.current.innerHTML
              this.annotatorView.current.innerHTML = document.annotated_content

              this.setState({
                changed: true,
                document: document
              })

            } catch {
              this.setState({
                error: { message: "Cannot set a new annotation overlapping an existing annotation."}
              })
            }            
          }
        }
    }
  }

  // function which saves the people information back to the document
  handlePeopleChange = (evt) => {
    let inputField = evt.target
    let id = inputField.name.split("-")[1]
    let document = this.state.document

    document.mentionedPeople[id].name = inputField.value

    this.setState({
      changed: true,
      document: document
    })
  }

  render() {
    const { classes } = this.props

    return (
      <Fragment>    
        <Typography className={ classes.title } variant="h4">Document Annotator</Typography>
        
        {this.state.document !== null ? (
          // document present
          <div>
            <Typography variant="h5"> { this.state.document.name } </Typography>
            { /* Top action buttons */ }
            <Button 
              size="small" 
              color="primary" 
              onClick={ this.handleSaveDocument }>
                <SaveAltIcon/>Save
            </Button>

            <Button 
              href={ `${ REACT_APP_BACKEND_URL }api/documents/${ this.state.documentId }/annotatedDoc/download` }
              size="small" 
              color="primary"
              className={ classes.buttons }
            >
              <CloudDownloadIcon/>Download annotated document .xml
            </Button>

            <Button 
              href={ `${ REACT_APP_BACKEND_URL }api/documents/${ this.state.documentId }/mentionedPeople/download` }
              size="small" 
              color="primary"
              className={ classes.buttons }
            >
              <DescriptionIcon/>Download mentioned people .csv
            </Button>

            <Button 
                onClick= { () => this.handleNextAnnotation(-1) }
                size="small" 
                color="primary"
                className={ classes.buttons }
              >
                <SkipPreviousIcon/>Previous Annotation
            </Button>

            <Button 
              onClick= { () => this.handleNextAnnotation(1) }
              size="small" 
              color="primary"
              className={ classes.buttons }
            >
              <SkipNextIcon/>Next Annotation
            </Button>
            
            <Box display="flex"  flexDirection="row" p={ 1 } m={ 1 }>
              { /* main annotator view */ }
              <Box border={ 1 } p={ 1 } className={ classes.annotatorView }>
                <ContextMenuTrigger id="contextMenu">
                  { /* dangourly update the html content based on state, but because we have no idea what we are doing, it is okay */ }
                  <div ref={ this.annotatorView } onMouseUp={ this.handleSelection } 
                      dangerouslySetInnerHTML={ { __html: this.state.document.annotated_content } }
                  >
                  </div>
                </ContextMenuTrigger>
              </Box>

              { /* sidebar */ }
              <Box p={1} className={ classes.annotatorViewAction }>
                { /* display symbols of people which have been been found */ }
                {this.state.document.mentionedPeople.length > 0 && (
                  <div>
                    <Typography variant="h6"> People in given document </Typography>

                      { this.state.document.mentionedPeople.map((people, i) => (
                        <Fragment key={i}>
                          <Typography> { people.symbol }</Typography>
                          <TextField
                            type="text"
                            name={ "peopleInput-" + i}
                            key={i}
                            value={ this.state.document.mentionedPeople[i].name }
                            onChange={ this.handlePeopleChange }
                          />
                        </Fragment>
                      ))}
                    </div>
                  )}

                  { /* explanation of the color code */ }
                  <Typography variant="h6">Color Code</Typography>
                  <Typography className="confirmedAtTypeLevel">Confirmed at type level</Typography>
                  <Typography className="disprovedAtTypeLevel">Disaproved at type level</Typography>
                  <Typography className="pendingAtTokenLevel">Pending at token level</Typography>
                  <Typography className="confirmedAtTokenLevel">Confirmed at token level</Typography>
                  <Typography className="disaprovedAtTokenLevel">Disaproved at token level</Typography>
                  <Typography className="newAnnotations">New annotations</Typography>
                </Box>
            </Box>
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

        { /* Context menu */ }
        <ContextMenu id="contextMenu">
          <MenuItem
            data={{ action: 'yes' }}
            onClick={ this.handleClick }
          >
            yes
          </MenuItem>

          <MenuItem
            data={{ action: 'no' }}
            onClick={ this.handleClick }
          >
            no
          </MenuItem>

          <MenuItem
            data={{ action: 'delete' }}
            onClick={ this.handleClick }
          >
            delete
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