import React from 'react';
import SidebarToggleHandler from '../../../../../@coremat/CmtLayouts/Vertical/SidebarToggleHandler';
import Toolbar from '@material-ui/core/Toolbar';
import { Box, InputBase, Typography } from '@material-ui/core';
import { alpha } from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SearchIcon from '@material-ui/icons/Search';
import { Link } from 'react-router-dom';

import LanguageSwitcher from '../LanguageSwitcher';
import AppsMenu from './AppsMenu';
import HeaderNotifications from './HeaderNotifications';
import HeaderMessages from './HeaderMessages';
import Hidden from '@material-ui/core/Hidden';
import Logo from '../Logo';
import SearchPopover from '../SearchPopover';

import IntlMessages from '@jumbo/utils/IntlMessages';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    paddingLeft: 16,
    paddingRight: 16,
    minHeight: 64,
    [theme.breakpoints.up('md')]: {
      minHeight: 72,
    },
    [theme.breakpoints.up('md')]: {
      paddingLeft: 24,
      paddingRight: 24,
    },
  },
  searchRoot: {
    position: 'relative',
    width: 260,
    [theme.breakpoints.up('md')]: {
      width: 350,
    },
    '& .MuiSvgIcon-root': {
      position: 'absolute',
      left: 18,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 1,
    },
    '& .MuiInputBase-root': {
      width: '100%',
    },
    '& .MuiInputBase-input': {
      height: 48,
      borderRadius: 30,
      backgroundColor: alpha(theme.palette.common.dark, 0.38),
      color: alpha(theme.palette.common.white, 0.7),
      boxSizing: 'border-box',
      padding: '5px 15px 5px 50px',
      transition: 'all 0.3s ease',
      '&:focus': {
        backgroundColor: alpha(theme.palette.common.dark, 0.58),
        color: alpha(theme.palette.common.white, 0.7),
      },
    },
  },
  langRoot: {
    borderLeft: `solid 1px ${alpha(theme.palette.common.dark, 0.15)}`,
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      minHeight: 64,
    },
  },
  iconBtn: {
    color: alpha(theme.palette.common.white, 0.38),
    '&:hover, &:focus': {
      color: theme.palette.common.white,
    },
  },
  linkText: {
    color: '#fff',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const Header = () => {
  const classes = useStyles();

  return (
    <Toolbar className={classes.root}>
      <SidebarToggleHandler edge="start" color="inherit" aria-label="menu" />
      <Logo ml={2} color="white" />
      <Box flex={1} />

      {/* Optional search and notification sections (uncomment if needed) */}
      {/* <Hidden smDown>
        <Box pr={3} className={classes.searchRoot}>
          <InputBase placeholder={'Search here...'} inputProps={{ 'aria-label': 'search' }} />
          <SearchIcon />
        </Box>
      </Hidden>
      <Hidden mdUp>
        <SearchPopover iconClassName={classes.iconBtn} />
      </Hidden>
      <AppsMenu />
      <HeaderMessages />
      <HeaderNotifications />
      <Box className={classes.langRoot}>
        <LanguageSwitcher />
      </Box> */}

      {/* Added Contact Us link */}
      <Box mx={1}>
        <Link to="/contact-us" className={classes.linkText}>
          <Typography variant="body1">
            <IntlMessages id="contact.title" />
          </Typography>
        </Link>
      </Box>
  <Box mx={1}>
        <Link to="/manage-subscription" className={classes.linkText}>
          <Typography variant="body1">
            <IntlMessages id="navbar.managesubscription" />
          </Typography>
        </Link>
      </Box>
      {/* Added Bug Report link */}
      {/* <Box mx={1}>
        <Link to="/bug-report" className={classes.linkText}>
          <Typography variant="body1">
            <IntlMessages id="sidebar.bug" />
          </Typography>
        </Link>
      </Box> */}
    </Toolbar>
  );
};

export default Header;
