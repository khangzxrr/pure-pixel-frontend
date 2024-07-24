import React from 'react';
import logo from './logo.svg';
import './App.css';

import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";


import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import Passwordless from "supertokens-auth-react/recipe/passwordless";
import Session from "supertokens-auth-react/recipe/session";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { PasswordlessPreBuiltUI } from 'supertokens-auth-react/recipe/passwordless/prebuiltui';
import * as reactRouterDom from "react-router-dom";
import Layout from './layout';
import Home from './home';

SuperTokens.init({
  appInfo: {
    appName: "PurePixel",
    apiDomain: "http://localhost:3000",
    websiteDomain: "http://localhost:3006",
    apiBasePath: "/auth",
    websiteBasePath: "/auth"
  },
  recipeList: [
    Passwordless.init({
      contactMethod: "EMAIL_OR_PHONE"
    }),
    Session.init(),
  ]
});

function App() {
  return (
    <SuperTokensWrapper>
      <BrowserRouter>
        <Routes>
          {/*This renders the login UI on the /auth route*/}
          {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [PasswordlessPreBuiltUI])}
          {/*Your app routes*/}
          <Route path='/' element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SuperTokensWrapper >
  );
}

export default App;
