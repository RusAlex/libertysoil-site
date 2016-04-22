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
/*eslint-env node */
import path from 'path';
import fs from 'fs';

import Koa from 'koa';
import mount from 'koa-mount';
import ejs from 'ejs';

import React from 'react';
import { renderToString } from 'react-dom/server'
import { createMemoryHistory } from 'history'
import { Provider } from 'react-redux';
import { Router, RouterContext, match, useRouterHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux';
import Helmet from 'react-helmet';
import ExecutionEnvironment from 'fbjs/lib/ExecutionEnvironment';

import { getRoutes } from './src/routing';
import { AuthHandler, FetchHandler } from './src/utils/loader';
import initBookshelf from './src/api/db';
import { API_HOST } from './src/config';
import ApiClient from './src/api/client'

import { initState } from './src/store';
import db_config from './knexfile';

import KoaRouter from 'koa-router';

import ApiController from './src/api/controller';

function initApi(bookshelf) {
  let controller = new ApiController(bookshelf);

  let wrap =
    (handler) =>
      (ctx, next) =>
        handler(ctx, next)
          .catch((e) => {
            console.log(`an error was thrown from url-handler of ${ctx.req.originalUrl}:\n`, e);  // eslint-disable-line no-console

            ctx.status = 500;
            ctx.body = {error: 'Internal Server Error'};
            // res.status(500);
            // res.send({error: 'Internal Server Error'});
          });

  let api = new KoaRouter();

  api.get('/test', controller.test);
  api.get('/tag-cloud', wrap(controller.getTagCloud.bind(controller)));

  return api.routes();
}

let exec_env = process.env.DB_ENV || 'development';

let app = new Koa();

let knexConfig = db_config[exec_env];
let bookshelf = initBookshelf(knexConfig);
let api = initApi(bookshelf);

let templatePath = path.join(__dirname, '/src/views/index.ejs');
let template = ejs.compile(fs.readFileSync(templatePath, 'utf8'), {filename: templatePath});

app.use(mount('/api/v1', api));

app.use(async function reactMiddleware(ctx, next) {
  const store = initState();

  const authHandler = new AuthHandler(store);
  const fetchHandler = new FetchHandler(store, new ApiClient(API_HOST, ctx));
  const Routes = getRoutes(authHandler.handle, fetchHandler.handleSynchronously);

  const makeRoutes = (history) => (
    <Router history={history}>
      {Routes}
    </Router>
  );

  const memoryHistory = useRouterHistory(createMemoryHistory)();
  const history = syncHistoryWithStore(memoryHistory, store, { selectLocationState: state => state.get('routing') });
  let routes = makeRoutes(history);

  match({ routes, location: ctx.url }, (error, redirectLocation, renderProps) => {
    try {
      let html = renderToString(
        <Provider store={store}>
          <RouterContext {...renderProps}/>
        </Provider>
      );
      let state = JSON.stringify(store.getState().toJS());

      if (fetchHandler.status !== null) {
        ctx.status = fetchHandler.status;
      }

      const metadata = ExecutionEnvironment.canUseDOM ? Helmet.peek() : Helmet.rewind();

      ctx.staus = 200;
      ctx.body = template({state, html, metadata});
    } catch (e) {
      console.error(e.stack);
      ctx.status = 500;
      ctx.body = e.message;
    }
  });

  await next();
});

export default app;
