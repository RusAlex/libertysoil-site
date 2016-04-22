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
import { Router, Route, IndexRoute, RouterContext, match, useRouterHistory } from 'react-router'
import Helmet from 'react-helmet';
import ExecutionEnvironment from 'fbjs/lib/ExecutionEnvironment';
import KoaRouter from 'koa-router';
import request from 'superagent';

import { FetchHandler } from './src/utils/loader';
import initBookshelf from './src/api/db';
import { API_HOST } from './src/config';
import { initState } from './src/store';
import db_config from './knexfile';
import ApiController from './src/api/controller';
import TagCloudPage from './src/pages/tag-cloud';
import { ActionsTrigger } from './src/triggers';


const SET_TAG_CLOUD = 'SET_TAG_CLOUD';

function setTagCloud(hashtags) {
  return {
    type: SET_TAG_CLOUD,
    hashtags
  }
}


class ApiClient
{
  host;

  constructor(host) {
    this.host = host;
  }

  // apiUrl(relativeUrl) {
  //   return `${this.host}${relativeUrl}`;
  // }

  // async get(relativeUrl, query = {}) {
  //   let req = request
  //     .get(this.apiUrl(relativeUrl))
  //     .query(query);

  //   return Promise.resolve(req);
  // }

  tagCloud() {
    return Promise.resolve(['tag1', 'tag2']);
  }
}

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

  const fetchHandler = new FetchHandler(store, new ApiClient(API_HOST, ctx));

  function getRoutes(client) {

    let onEnter = function(nextState) {
      let len = nextState.routes.length;
      for (let i = len; i--; i >= 0) {
        let route = nextState.routes[i];

        if ('component' in route && 'fetchData' in route.component) {
          try {
            let tags = ['tag1'];
            store.dispatch(setTagCloud(tags));
          } catch (e) {
            console.log('error');
          }
        }
      }

      console.log('onenter finished');
    } // end x

    return (
      <Route path="/tag">
        <IndexRoute component={TagCloudPage} onEnter={onEnter} />
      </Route>
    );
  }

  const Routes = getRoutes(fetchHandler.apiClient);

  const makeRoutes = () => (
    <Router>
      {Routes}
    </Router>
  );

  const memoryHistory = useRouterHistory(createMemoryHistory)();
  let routes = makeRoutes();
  match({ routes, location: ctx.url }, (error, redirectLocation, renderProps) => {
    try {
      let html = renderToString(
        <Provider store={store}>
          <RouterContext {...renderProps}/>
        </Provider>
      );
      console.log('rendered to string', html);
      let state = JSON.stringify(store.getState().toJS());

      const metadata = ExecutionEnvironment.canUseDOM ? Helmet.peek() : Helmet.rewind();

      ctx.staus = 200;
      ctx.body = template({state, html, metadata});
      console.log('setting body react');
    } catch (e) {
      console.error(e.stack);
      ctx.status = 500;
      ctx.body = e.message;
    }
  });

});

export default app;
