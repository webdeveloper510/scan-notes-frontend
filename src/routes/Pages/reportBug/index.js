import React from 'react';
import { Box, Button, Container, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import IntlMessages from '@jumbo/utils/IntlMessages';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
    paddingTop: theme.spacing(10),
    textAlign: 'center',
  },
  form: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    alignItems: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 600,
  },
  button: {
    marginTop: theme.spacing(3),
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    width: '100%',
    maxWidth: 600,
    height: 45,
  },
}));

const ReportBug = () => {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <Typography variant="h5">
        <IntlMessages id="bug.title" />
      </Typography>

      <form className={classes.form}>
        <TextField label={<IntlMessages id="bug.name" />} required variant="outlined" className={classes.input} />
        <TextField label={<IntlMessages id="bug.email" />} required variant="outlined" className={classes.input} />
        <TextField
          label={<IntlMessages id="bug.description" />}
          required
          variant="outlined"
          multiline
          rows={4}
          className={classes.input}
        />
        <TextField
          label={<IntlMessages id="bug.steps" />}
          required
          variant="outlined"
          multiline
          rows={4}
          className={classes.input}
        />
        <TextField
          label={<IntlMessages id="bug.severity" />}
          required
          type="number"
          inputProps={{ min: 1, max: 5 }}
          variant="outlined"
          className={classes.input}
        />

        <Button type="submit" variant="contained" className={classes.button}>
          <IntlMessages id="bug.submit" />
        </Button>
      </form>
    </Container>
  );
};

export default ReportBug;
