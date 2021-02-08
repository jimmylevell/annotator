import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  withStyles,
} from '@material-ui/core';
import { compose } from 'recompose';
import FeedbackIcon from '@material-ui/icons/Feedback';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import Help from './help'

const styles = theme => ({
  header: {
    backgroundColor: "#3892bd",
  },
  text: {
    fontSize: '4.5em',
    color: '#f50057',
  },
  headerButton: {
    position: 'fixed',
    top: theme.spacing(-0.5),
    right: theme.spacing(),
    color: '#f50057',
    [theme.breakpoints.down('xs')]: {
      top: theme.spacing(-1),
      right: theme.spacing(0),
    }
  },
  link: {
    fontSize: '1.5em',
    color: 'white',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    textDecoration: 'none'
  },
  displayName: {
    marginRight: theme.spacing(10)
  },
  helpIcon: {
    fontSize: '4.5em',
    color: 'white',
  }
})

class AppHeader extends Component {
  constructor() {
    super()

    this.state = {
      person: localStorage.getItem("person") || "",
      showHelp: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
  }

  componentDidMount() {
    if(this.state.person === "") {
      this.handleNameChange()
    }
  }

  handleNameChange() {
    let person = localStorage.getItem("person") || "Hairy Potter"
    person = prompt("Please enter your name:", person)

    this.setState({
      person: person
    }, localStorage.setItem("person", person))
  }

  handleChange() {
    this.setState({
      showHelp: !this.state.showHelp
    })
  }

  render() {
    const { classes } = this.props;
    
    return (
    <AppBar position="static" className={ classes.header }>
      <Toolbar className={ classes.toolBar }>
        <Button color="inherit" component={ Link } to="/">
          <FeedbackIcon/>
          <Typography variant="h6" color="inherit">
            Annotator 
          </Typography>
        </Button>

        {/* link collection */}
        <Box display='flex' flexGrow={ 1 }>
            {/* whatever is on the left side */}
          <Link className={ classes.link } to="/fileupload">Upload</Link>
          <Link className={ classes.link } to="/documents">Documents</Link>
        </Box>

        {/* whatever is on the right side */}
        <Typography className={ classes.displayName } onClick={ this.handleNameChange }>Hello, { this.state.person }</Typography>
      </Toolbar>

      <Button 
        onClick={ this.handleChange }
        className={ classes.headerButton }
      >
        <HelpOutlineIcon 
          color="secondary"
          aria-label="add"
          className={ classes.helpIcon }
        />
      </Button>
      <Help handleChange={ this.handleChange } showModal={ this.state.showHelp }/>
    </AppBar>
    )
  }
}

export default compose(
  withStyles(styles),
)(AppHeader);