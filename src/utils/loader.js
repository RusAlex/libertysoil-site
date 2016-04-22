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
import { isPlainObject, isNumber } from 'lodash';
import { browserHistory } from 'react-router';

export class FetchHandler {
  status = null;
  redirectTo = null;

  constructor(store, apiClient) {
    this.store = store;
    this.apiClient = apiClient;
  }

  handle = async (nextState) => {
    let len = nextState.routes.length;

    for (let i = len; i--; i >= 0) {
      let route = nextState.routes[i];

      if ('component' in route && 'fetchData' in route.component) {
        try {
          const response = await route.component.fetchData(nextState.params, this.store, this.apiClient);

          if (isPlainObject(response)) {
            const {status, redirectTo} = response;
            this.status = status;
            this.redirectTo = redirectTo;

            browserHistory.push(redirectTo);
          } else if (isNumber(response)) {
            this.status = response;
          }
        } catch (e) {
          // FIXME: handle error in a useful fashion (show "Network error" to user, ask to reload page, etc.)
          console.error(e);  // eslint-disable-line no-console
        }
      }
    }
  };

  handleSynchronously = (nextState, replace, callback) => {
    this.handle(nextState)
      .then(() => { callback(); })
      .catch((e) => {
        // FIXME: this should be reported to developers instead (use Sentry?)
        console.error(e);  // eslint-disable-line no-console
        callback(e);
      });
  };
}
