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

const styles = theme => ({
  flex: {
    flex: 1,
  },
  text: {
    fontSize: '4.5em',
    color: '#f50057',
  },
  link: {
    fontSize: '1.5em',
    color: 'white',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    textDecoration: 'none'
  }
})

class AppHeader extends Component {
  constructor() {
    super();
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
    </AppBar>
    )
  }
}

export default compose(
  withStyles(styles),
)(AppHeader);