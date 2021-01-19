import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  withStyles,
} from '@material-ui/core';
import { compose } from 'recompose';
import FeedbackIcon from '@material-ui/icons/Feedback';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import Help from './help'

const styles = theme => ({
  flex: {
    flex: 1,
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
  helpIcon: {
    fontSize: '4.5em',
    color: 'white',
  }
})

class AppHeader extends Component {
  constructor() {
    super()

    this.state = {
      showHelp: false
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange() {
    this.setState({
      showHelp: !this.state.showHelp
    })
  }

  render() {
    const { classes } = this.props;
    
    return (
    <AppBar position="static">
      <Toolbar className={ classes.toolBar }>
        <Button color="inherit" component={ Link } to="/">
          <FeedbackIcon/>
          <Typography variant="h6" color="inherit">
            Annotator 
          </Typography>
        </Button>

        {/* link collection */}
        <Link className={ classes.link } to="/fileupload">Upload</Link>
        <Link className={ classes.link } to="/documents">Documents</Link>
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
      <Help handleChange={ this.handleChange} showModal={ this.state.showHelp }/>
    </AppBar>
    )
  }
}

export default compose(
  withStyles(styles),
)(AppHeader);