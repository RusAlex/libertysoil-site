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
import { parse as parseUrl } from 'url';
import path from 'path';
import fs from 'fs';

import Koa from 'koa';
import { isString, indexOf } from 'lodash';
import session from 'koa-generic-session';
import redisStore from 'koa-redis';
import convert from 'koa-convert';
import cors from 'kcors';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import knexLogger from 'knex-logger';
import chokidar from 'chokidar';
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
import {initApi} from './src/api/routing'
import initBookshelf from './src/api/db';
import { API_HOST } from './src/config';
import ApiClient from './src/api/client'

import { initState } from './src/store';
import {
  setCurrentUser, setLikes, setFavourites, setUserFollowedTags,
  setUserFollowedSchools, setUserFollowedGeotags
} from './src/actions';

import db_config from './knexfile';


let exec_env = process.env.DB_ENV || 'development';

let app = new Koa();

let knexConfig = db_config[exec_env];
let bookshelf = initBookshelf(knexConfig);
let api = initApi(bookshelf);

let templatePath = path.join(__dirname, '/src/views/index.ejs');
let template = ejs.compile(fs.readFileSync(templatePath, 'utf8'), {filename: templatePath});

if (exec_env === 'development') {
  let webpackDevMiddleware = require('webpack-koa-dev-middleware').default;
  let webpackHotMiddleware = require('webpack-koa-hot-middleware').default;
  let webpack = require('webpack');
  let webpackConfig = require('./webpack.dev.config');
  let compiler = webpack(webpackConfig);

  app.use(convert(webpackDevMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    }
  })));
  app.use(convert(webpackHotMiddleware(compiler)));

  // Taken from https://github.com/glenjamin/ultimate-hot-reloading-example/blob/master/server.js

  // Do "hot-reloading" of express stuff on the server
  // Throw away cached modules and re-require next time
  // Ensure there's no important state in there!
  var watcher = chokidar.watch('./src/api');
  watcher.on('ready', function () {
    watcher.on('all', function () {
      console.log('Clearing /src/api/ cache from server');
      Object.keys(require.cache).forEach(function (id) {
        if (/\/src\/api\//.test(id)) delete require.cache[id];
      });
    });
  });

  // Do "hot-reloading" of react stuff on the server
  // Throw away the cached client modules and let them be re-required next time
  compiler.plugin('done', function () {
    console.log('Clearing /src/ cache from server');
    Object.keys(require.cache).forEach(function (id) {
        if (/\/src\//.test(id)) delete require.cache[id];
      });
  });
}

app.use(async (ctx, next) => {
  const { hostname } = parseUrl(API_HOST);
  if (isString(ctx.req.hostname) && ctx.req.hostname !== hostname) {
    const newUri = `${API_HOST}${ctx.req.originalUrl}`;
    ctx.status = 301;
    ctx.redirect(newUri);
    return;
  }
  await next();
});

app.keys = ['libertysoil'];

app.use(convert(session({
  store: redisStore(
    {
      host: '127.0.0.1',
      port: 6379
    }
  ),
  key: 'connect.sid',
  cookie: {signed: false}
})));

app.use(bodyParser());  // for parsing application/x-www-form-urlencoded

app.use(convert(cors({
  allowHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
})));

if (indexOf(['test', 'travis'], exec_env) !== -1) {
  let warn = console.error; // eslint-disable-line no-console
  console.error = function(warning) { // eslint-disable-line no-console
    if (/(Invalid prop|Failed propType)/.test(warning)) {
      throw new Error(warning);
    }
    warn.apply(console, arguments);
  };
}

app.use(mount('/api/v1', api));

app.use(convert(serve('public/')));

app.use(async function reactMiddleware(ctx, next) {
  const store = initState();

  if (ctx.session && ctx.session.user && isString(ctx.session.user)) {
    try {
      let user = await bookshelf
        .model('User')
        .where({id: ctx.session.user})
        .fetch({
          require: true,
          withRelated: [
            'following',
            'followed_hashtags',
            'followed_schools',
            'followed_geotags',
            'liked_hashtags',
            'liked_geotags',
            'liked_schools'
          ]
        });

      let data = user.toJSON();

      let likes = await bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: ctx.session.user});

      let favourites = await bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: ctx.session.user});

      store.dispatch(setCurrentUser(data));
      store.dispatch(setLikes(data.id, likes.map(like => like.post_id)));
      store.dispatch(setFavourites(data.id, favourites.map(fav => fav.post_id)));
    } catch (e) {
      console.log(`dispatch failed: ${e.stack}`);
    }
  }

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
    if (redirectLocation) {
      ctx.status = 307;
      ctx.redirect(redirectLocation.pathname + redirectLocation.search);
      return;
    }

    if (error) {
      ctx.status = 500;
      ctx.body = error.message;
      return;
    }

    if (renderProps == null) {
      ctx.status = 404;
      ctx.body = 'Not found';
      return;
    }

    if (fetchHandler.redirectTo !== null) {
      ctx.status = fetchHandler.status;
      ctx.redirect(fetchHandler.redirectTo);
      return;
    }

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
