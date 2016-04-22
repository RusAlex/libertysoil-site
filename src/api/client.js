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
import request from 'superagent';

export default class ApiClient
{
  host;

  constructor(host) {
    this.host = host;
  }

  apiUrl(relativeUrl) {
    return `${this.host}${relativeUrl}`;
  }

  async get(relativeUrl, query = {}) {
    let req = request
      .get(this.apiUrl(relativeUrl))
      .query(query);

    return Promise.resolve(req);
  }

  async tagCloud() {
    let response = await this.get('/api/v1/tag-cloud');

    return response.body;
  }
}
