import React, { Component, Fragment } from 'react';
import {
  withStyles,
  Card,
  CardContent,
  CardActions,
  Modal,
  Button,
  Typography,
  TextField,
  Grid
} from '@material-ui/core';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import ClearIcon from '@material-ui/icons/Clear';
import FindReplaceIcon from '@material-ui/icons/FindReplace';

import LoadingBar from './loadingBar'
import ErrorSnackbar from './errorSnackbar'

const filter = createFilterOptions();
const styles = theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 800,
    marginTop: theme.spacing(2),
  },
  modalCardContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    marginTop: theme.spacing(2)
  },
  inputArea: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    maxHeight: "70vh",
    overflowY: "scroll",
    overflowX: "hidden",
    borderStyle: "solid"
  },
  gridElement: {
      marginTop: theme.spacing(2)
  },
});
const MAX_CHARS_FOR_SURROUNDING = 30    // max characaters for surrounding elements
const PRESET_ANONYMIZED_LABELS = [
  { title:"per001" },
  { title:"org001" },
  { title:"prj001" }
]

class AnonymizationEditor extends Component {
  constructor() {
    super()

    this.state = {
      namedTags: [
        { id: 0, annotation: '', surrounding: '', anonymizedLabel: ''}
      ],
      anonymizedLabels: JSON.parse(JSON.stringify(PRESET_ANONYMIZED_LABELS)), // create a deep copy of the object

      changed: false,
      showModal: false,
      error: null,
      loading: true
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleReplaceAll = this.handleReplaceAll.bind(this)
  }

  componentDidUpdate() {
    if(this.state.showModal !== this.props.showModal) {
      let passed_namedTags = Array.from(this.props.namedTags)

      // extract <NE></NE> which have status confirmed, so therefore need to be anonymized
      passed_namedTags = passed_namedTags.filter(element => element.getAttribute("status") === "confirmed-at-token-level" ||
                                              element.getAttribute("status") === "confirmed-at-type-level")

      let namedTags = []
      passed_namedTags.forEach(element => {
        namedTags.push({
          id: element.id,
          annotation: element.innerText,
          surrounding: this.getSurroundingContent(element),
          anonymizedLabel: element.getAttribute("anonymizedLabel")
        })

        if(element.getAttribute("anonymizedLabel")) {
          this.addLabelIfNotExisting({inputValue: element.getAttribute("anonymizedLabel")})
        }
      })

      this.setState({ 
         namedTags: namedTags,

         showModal: this.props.showModal,
         loading: false
      })
    }
  }

  // function which extracts content before and after given DOM element, surrounding is limited by MAX_CHARS_FOR_SURROUNDING
  getSurroundingContent(element) {
    let annotationElement = element.innerText
    let before = ""
    let after = ""

    if(element.previousSibling) {
      before = element.previousSibling.textContent + " "
    }

    if(element.previousElementSibling) {
      before = before + element.previousElementSibling.innerText
    }

    if(element.nextElementSibling) {
      after = element.nextSibling.textContent + " "
    }

    if(element.nextElementSibling) {
      after = after + element.nextElementSibling.innerText
    }

    // limit display to MAX_CHARS_FOR_SURROUNDING
    before = before.substring(before.length - MAX_CHARS_FOR_SURROUNDING, before.length)
    after = after.substring(0, MAX_CHARS_FOR_SURROUNDING)

    return before + " <b>" + annotationElement + "</b> " + after
  }
  
  // check if a typed label exists in the current state
  checkIfLabelExists(label) {
    let labels = this.state.anonymizedLabels
    let exists = false

    labels.forEach(element => {
      if(label.inputValue === element.title) {
        exists = true
      }
    })

    return exists
  }

  // adds typed label if it is not existing in current state
  addLabelIfNotExisting(label) {
    if(!this.checkIfLabelExists(label)) {
      let labels = this.state.anonymizedLabels
      labels.push({title: label.inputValue})

      this.setState({
        anonymizedLabels: labels
      })
    }
  }

  // handling save of form
  handleChange() {
    let parentHandler= this.props.handleChange
    let namedTags = this.state.namedTags

    // get <NE></NE> which have not be configured with a anonymization label
    let missingAnonymizationLabels = namedTags.filter(element => !element.anonymizedLabel)

    if(missingAnonymizationLabels.length > 0) {
      this.setState({
        error: {message: "You have still " + missingAnonymizationLabels.length + " misssing anonymizations to make, please go back to the anonymization wizzard. The current changes have still been saved"}
      })
    }

    // hide editor and execute parent handler
    this.setState({
      showModal: !this.state.showModal
    }, parentHandler(namedTags))
  }

  // handles close of modal
  handleClose() {
    let parentHandler= this.props.handleClose

    if(this.state.changed) {
      if(window.confirm("You have unsaved changes do you really want to leave without saving?")) {
        // hide editor and execute parent handler
        this.setState({
          showModal: !this.state.showModal
        }, parentHandler)
      }
    } else {
      this.setState({
        showModal: !this.state.showModal
      }, parentHandler)
    }
  }

  onDropDownChange(event, newValue, key) {
    if (typeof newValue === 'string') {
      // change of input, update state

      // check if given value exists in state already, other wise add
      this.addLabelIfNotExisting({inputValue: newValue})

      // update value
      let namedTags = this.state.namedTags
      namedTags[key].anonymizedLabel = newValue
      this.setState({
        namedTags: namedTags,
        changed: true
      });
    } else if (newValue && newValue.inputValue) {
      // change of input, update state

      // check if given value exists in state already, other wise add
      this.addLabelIfNotExisting(newValue)
      
      // update value
      let namedTags = this.state.namedTags
      namedTags[key].anonymizedLabel = newValue.inputValue
      this.setState({
        namedTags: namedTags,
        changed: true
      });
    } else {
      // received updated object, use as whole

      // update value
      let namedTags = this.state.namedTags

      namedTags[key].anonymizedLabel = newValue ? newValue.title : ""
      this.setState({
        namedTags: namedTags,
        changed: true
      });
    }
  }

  onDropDownFilter(options, params) {
    const filtered = filter(options, params);

    // Suggest the creation of a new value
    if (params.inputValue !== '') {
      filtered.push({
        inputValue: params.inputValue,
        title: `Add "${ params.inputValue }"`,
      });
    }

    return filtered;
  }

  handleReplaceAll(evt, key) {
    let namedTags = this.state.namedTags
    let annotation = namedTags[key].annotation
    let anonymizedLabel = namedTags[key].anonymizedLabel

    namedTags.forEach(namedTag => {
      if(namedTag.annotation === annotation && anonymizedLabel) {
        namedTag.anonymizedLabel = anonymizedLabel
      }
    })

    this.setState({
      namedTags: namedTags
    })
  }

  render() {
    const { classes } = this.props

    return (
      <Fragment>
        {this.state.showModal && this.state.namedTags && this.state.namedTags.length > 0 && (
          <Modal
            className={ classes.modal }
            onClose={ this.handleClose }
            open
          >
            <Card className={ `${ classes.modalCard }` }>
                <CardContent className={ classes.modalCardContent }>
                  <Typography variant="h6">Anonymization Definition</Typography>
                  <Typography> Define for each confirmed nametag an corresponding anonymized label</Typography> 

                  <Grid container spacing={ 1 } className={ classes.gridElement }>
                      <Grid item xs={ 2 }>
                        <Typography>Annotated element</Typography>
                      </Grid>
                      <Grid item xs={ 4 }>
                        <Typography>Context</Typography>
                      </Grid>
                      <Grid item xs={ 4 }>
                        <Typography>Anonymized Label</Typography>
                      </Grid>
                      <Grid item xs={ 2 }>
                      </Grid>
                  </Grid>

                  <div className={ classes.inputArea }>
                    {this.state.namedTags.map((namedTag, key) => 
                      <Grid container spacing={ 1 } className={ classes.gridElement }>
                        <Grid item xs={ 2 } >
                          <Typography>{ namedTag.annotation }</Typography>
                        </Grid>
                        <Grid item xs={ 4 }>
                          <Typography dangerouslySetInnerHTML={ {__html: this.state.namedTags[key].surrounding} }></Typography>
                        </Grid>
                        <Grid item xs={ 4 }>                  
                          <Autocomplete
                            value={ this.state.namedTags[key].anonymizedLabel }
                            onChange={(event, newValue) => this.onDropDownChange(event, newValue, key)}
                            filterOptions={(options, params) => this.onDropDownFilter(options, params)}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            id={ `anonyimizationDropdown-${key}` }
                            key={ `anonyimizationDropdown-${key}` }
                            options={ this.state.anonymizedLabels} 
                            getOptionLabel={(option) => {
                              // Value selected with enter, right from the input
                              if (typeof option === 'string') {
                                return option;
                              }
                              // Add "xxx" option created dynamically
                              if (option.inputValue) {
                                return option.inputValue;
                              }
                              // Regular option
                              return option.title;
                            }}
                            renderOption={(option) => option.title}
                            freeSolo
                            renderInput={(params) => (
                              <TextField {...params} label="Anonymized Label" variant="outlined" key={ `anonyimizationDropdownElement-${key}` } />
                            )}
                            />
                        </Grid>
                        <Grid item xs={ 2 }>
                          <Button 
                            size="small" 
                            onClick={ (evt) => this.handleReplaceAll(evt, key) }
                          >
                              <FindReplaceIcon/>Replace all
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                  </div>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={ this.handleClose }><ClearIcon/>Close</Button>
                  <Button size="small" color="primary" onClick={ this.handleChange }><SaveAltIcon/>Save</Button>
                </CardActions>
            </Card>
          </Modal>
        )}

        { /* Flag based display of error snackbar */ }
        {this.state.error && (
          <ErrorSnackbar
            onClose={() => this.setState({ error: null })}
            message={ this.state.error.message }
          />
        )}

        { /* Flag based display of loadingbar */ }
        {this.state.showModa && this.state.loading && (
          <LoadingBar/>
        )}
      </Fragment>
    )
  }
}

export default compose(
  withRouter,
  withStyles(styles),
)(AnonymizationEditor);