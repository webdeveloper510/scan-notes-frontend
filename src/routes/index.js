import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import DashBoard from './Pages/DashBoard';
import DetailPage from './Pages/DetailPage';
import Error404 from './Pages/404';
import Login from './Auth/Login';
import Register from './Auth/Register';
import ForgotPasswordPage from './Auth/ForgotPassword';
import ForgotPassword from '@jumbo/components/Common/authComponents/ForgotPassword';
import ResetPassword from '@jumbo/components/Common/authComponents/ResetPassword';
import SubscriptionPage from './Pages/subscription';
import HistoryPage from './Pages/history';
import ManageSubscriptionPage from './Pages/subscription/managesubscription.js';

const RestrictedRoute = ({ component: Component, ...rest }) => {
  const { authUser } = useSelector(({ auth }) => auth);
  return (
    <Route
      {...rest}
      render={props =>
        authUser ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/signin',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

const Routes = () => {
  const { authUser } = useSelector(({ auth }) => auth);
  const location = useLocation();

  if (location.pathname === '' || location.pathname === '/') {
    return <Redirect to={'/dashboard'} />;
  } else if (authUser && location.pathname === '/signin') {
    return <Redirect to={'/dashboard'} />;
  }

  return (
    <React.Fragment>
      <Switch>
        <RestrictedRoute path="/dashboard" component={DashBoard} />
        <RestrictedRoute path="/detail-page" component={DetailPage} />
        <Route path="/signin" component={Login} />
        <Route path="/signup" component={Register} />
        <Route path="/forgot-password/:token?" component={ForgotPassword} />
        <Route path="/subscription" component={SubscriptionPage}/>
        <Route path="/history" component={HistoryPage} />
        <Route path="/manage-subscription" component={ManageSubscriptionPage} />
        <Route component={Error404} />

      </Switch>
    </React.Fragment>
  );
};

export default Routes;
