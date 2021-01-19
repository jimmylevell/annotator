import React, { Component, Fragment } from 'react';
import {
  withStyles,
  Card,
  CardContent,
  CardActions,
  Modal,
  Button,
  Typography,
} from '@material-ui/core';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import ClearIcon from '@material-ui/icons/Clear';

const styles = theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 500,
  },
  modalCardContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  marginTop: {
    marginTop: theme.spacing(10),
  },
});

class Help extends Component {
  constructor() {
    super()

    this.state = {
      showModal: false
    }

    this.handleChange = this.handleChange.bind(this)
  }

  componentDidUpdate() {
    if(this.state.showModal !== this.props.showModal) {
      this.setState({ showModal: this.props.showModal})
    }
  }
  
  handleChange() {
    let parentHandler= this.props.handleChange
    this.setState({
      showModal: !this.state.showModal
    }, parentHandler)
  }

  render() {
    const { classes, history } = this.props
    const APP_VERSION = process.env.REACT_APP_VERSION

    return (
      <Fragment>
      {this.state.showModal && (
        <Modal
          className={ classes.modal }
          onClose={() => history.goBack()}
          open
        >
          <Card className={`${ classes.modalCard } ${ classes.marginTop }`}>
              <CardContent className={ classes.modalCardContent }>
              <Typography variant="h6">About the app</Typography>
              <Typography> Application for centrally storing and managing documents. The documents can be enriched with annotation stored in csv files. The csv files are defined per languguage. The annotator can view and change the annotations of a document. </Typography>
              <Typography>App version: { APP_VERSION }</Typography>
              <Typography variant="h6">Process</Typography>
              <Typography>Upload .txt document -> automatic addition of annotation in a safe context -> change of the annoation -> export annotated document as .xml</Typography>
              <br/>
              <Typography>Through the "Upload" button you are able to save a .txt document to the database. During this process the content of the document is being annoated based on the .csv source annotation file. </Typography>
              <Typography>It is important to note that the original content is always left unchanged and the annoations are made in a separte and isolated context. </Typography>
              <Typography>Through the edit button on the document view you are able to edit the original content of the document. The seperate and isolated annoation context is not automatically updated. This has to be manually triggered through the corresponding button in the edit view.</Typography>
              <Typography>The annotated document can be send to an annotator which has the possibility to change the annoations of maybe annotations and save the annotated document again. </Typography>
              <Typography>The annotator can not change the annotations which have the decision "yes". </Typography>
              </CardContent>          
              <CardActions>
                <Button size="small" onClick={ this.handleChange }><ClearIcon/>Close</Button>
              </CardActions>
          </Card>
        </Modal>
      )}

      </Fragment>
    )
  }
}

export default compose(
  withRouter,
  withStyles(styles),
)(Help);