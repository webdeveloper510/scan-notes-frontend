import React from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import 'react-perfect-scrollbar/dist/css/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Toaster } from 'react-hot-toast'; // Changed from react-toastify
import configureStore, { history } from './redux/store';
import AppWrapper from './@jumbo/components/AppWrapper';
import AppContextProvider from './@jumbo/components/contextProvider/AppContextProvider';
import StandaloneWrapper from 'routes/Components/standalonewrapper';
import Routes from './routes';
import ContactUs from 'routes/Pages/contactUs';
import ReportBug from 'routes/Pages/reportBug';
import ResetPassword from '@jumbo/components/Common/authComponents/ResetPassword';

export const store = configureStore();

const App = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <AppContextProvider>
        <Switch>
          {/* Routes without dashboard layout */}
          <Route path="/contact-us">
            <StandaloneWrapper>
              <ContactUs />
            </StandaloneWrapper>
          </Route>
          <Route path="/bug-report">
            <StandaloneWrapper>
              <ReportBug />
            </StandaloneWrapper>
          </Route>
          <Route path="/reset-password/:token">
            <StandaloneWrapper>
              <ResetPassword />
            </StandaloneWrapper>
          </Route>
          {/* Routes with dashboard layout */}
          <Route path="/">
            <AppWrapper>
              <Routes />
            </AppWrapper>
          </Route>
        </Switch>
      </AppContextProvider>
      <Toaster position="top-right" />
    </ConnectedRouter>
  </Provider>
);

export default App;
