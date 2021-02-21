import React, { Component, Fragment } from 'react';
import {
  withStyles,
  Card,
  CardContent,
  CardActions,
  Modal,
  Button,
  Typography,
  Grid
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
    maxWidth: 700,
    height: '85%',
    overflowY: 'scroll',
  },
  modalCardContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  marginTop: {
    marginTop: theme.spacing(5),
  },
  textCenter: {
    margin: 'auto'
  },
  images: {
    width: '100%'
  },
  links: {
    textDecoration: 'none',
    color: 'black'
  },
  header: {
    marginTop: theme.spacing(2)
  }
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
    const { classes } = this.props
    const APP_VERSION = process.env.REACT_APP_VERSION

    return (
      <Fragment>
      {this.state.showModal && (
        <Modal
          className={ classes.modal }
          onClose={ this.handleChange }
          open
        >
          <Card className={`${ classes.modalCard } ${ classes.marginTop }`}>
              <CardContent className={ classes.modalCardContent }>
                <Typography variant="h6">About the app</Typography>
                <Typography> This application is for centrally storing and managing documents. These documents can be enriched with annotation stored in csv files. The csv files are defined per language. You can view and change the annotations of a document. </Typography>
                <Typography>App version: { APP_VERSION }</Typography>
                <Typography className={ classes.header } variant="h6">Process</Typography>
                <Typography>Upload .txt document -> application automaticaly adds annotations in a safe context -> change the annotations -> export the annotated document as .xml</Typography>
                <br/>
                <Typography>Through the "Upload" button you are able to save a .txt document to the application. During this process, the content of the document is being annotated based on the .csv source annotation file. </Typography>
                <Typography>It is important to note that the original content is always left unchanged and the annotations are made in a separate and isolated context. </Typography>
                <Typography>Through the "Edit" button on the document view, you are able to edit the original content of the document. The seperated and isolated annotation context is not automatically updated. This has to be manually triggered through the corresponding button in the edit view.</Typography>
                <Typography>The annotated document can be send to an annotator which has the possibility to change the annotations. </Typography>

                <Typography className={ classes.header } variant="h6">Developing Organization</Typography>
                <img className={ classes.images } src={`${window.location.origin}/annotator/images/elitr.png`} alt="ELITR Research Project"/>

                <Typography variant="h6">Project team</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4} className={ classes.textCenter }>
                    <a href="https://levell.ch/" target="_blank" className={ classes.links }><Typography>James Levell, Developer</Typography></a>
                  </Grid>
                  <Grid item xs={8}>
                    <img className={ classes.images } src={`${window.location.origin}/annotator/images/team/levell.jpg`} alt="James Levell"/>
                  </Grid>
                </Grid>
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