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
var Koa = require('koa');
var mount = require('koa-mount');
var React = require('react');
var fetch = require('node-fetch');
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var IndexRoute = require('react-router').IndexRoute;
var match = require('react-router').match;
var KoaRouter = require('koa-router');
var app = new Koa();

app.use(mount('/api/v1', function() {
  var simpleAction = function(ctx) {
    ctx.status = 200;
    ctx.body = ['tag1', 'tag2'];
  };

  var api = new KoaRouter();

  api.get('/tag-cloud', simpleAction);

  return api.routes();
}()));

app.use(function *(next) {
  var testComponent = new React.Component;
  const routes = [
    { path: '/tag',
      component: testComponent
    }
  ];
  yield next;
  match({ routes, location: this.url }, (error, redirectLocation, renderProps) => {
    fetch('http://localhost:8000/api/v1/tag-cloud')
      .then(function(res) {
        return res.json();
      }).then(function(json) {
        this.status = 200;
        this.body = 'JsonTest';
        console.log(json);
      });
  });
});

app.listen(8000, function (err) {
  if (err) {
    console.error(err);  // eslint-disable-line no-console
    process.exit(1);
  }

  process.stdout.write(`Listening at http://0.0.0.0:8000\n`);
});
