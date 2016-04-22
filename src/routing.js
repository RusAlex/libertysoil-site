/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import {
  Route,
  IndexRoute
} from 'react-router';
import React from 'react';

import { combineHandlers, combineHandlersAsync } from './utils/loader';

import App from './pages/app';
import TagCloudPage from './pages/tag-cloud';


export function getRoutes(authHandler, fetchHandler) {
  let withoutAuth = fetchHandler;
  let withAuth;

  if (authHandler.length >= 3 || fetchHandler.length >= 3) {
    withAuth = combineHandlersAsync(authHandler, fetchHandler);
  } else {
    withAuth = combineHandlers(authHandler, fetchHandler);
  }

  return (
    <Route component={App}>
      <Route path="/tag">
        <IndexRoute component={TagCloudPage} onEnter={withoutAuth} />
      </Route>
    </Route>
  );
}
