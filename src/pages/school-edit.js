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
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import BaseSchoolPage from './base/school'
import { getStore } from '../store';
import { addSchool } from '../actions';
import { updateSchool } from '../triggers'
import { defaultSelector } from '../selectors';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';

class SchoolEditPage extends React.Component {
  static displayName = 'SchoolEditPage';

  static async fetchData(params, props, client) {
    try {
      let schoolInfo = await client.schoolInfo(params.school_name);

      getStore().dispatch(addSchool(schoolInfo));
    } catch (e) {
      console.log(e.stack)
    }
  }

  submitHandler(event) {
    event.preventDefault();

    let form = event.target;

    updateSchool(
      form.id.value,
      {
        name: form.name.value,
        description: form.description.value
      }
    ).then((result) => {
      this.props.history.pushState(null, getUrl(URL_NAMES.SCHOOL, {url_name: result.url_name}));
    });
  }

  render() {
    let school = _.find(this.props.schools, {url_name: this.props.params.school_name});

    return (
      <BaseSchoolPage
        current_user={this.props.current_user}
        is_logged_in={this.props.is_logged_in}
        page_school={school}
      >
        <div className="paper">
          <div className="paper__page">
            <form onSubmit={this.submitHandler.bind(this)}>
              <input type="hidden" name="id" value={school.id} />

              <div className="layout__row">
                <label htmlFor="name" className="layout__block layout__row layout__row-small">Name</label>
                <input
                  className="input input-block content layout__row layout__row-small"
                  defaultValue={school.name}
                  name="name"
                  type="text"
                />
              </div>

              <div className="layout__row">
                <label htmlFor="description" className="layout__block layout__row layout__row-small">Description</label>
                <textarea
                  className="input input-block input-textarea content layout__row layout__row-small"
                  defaultValue={school.description}
                  name="description"
                />
              </div>
              <div className="layout__row">
                <div className="layout layout__grid layout-align_right">
                  <button className="button button-wide button-green" type="submit">Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </BaseSchoolPage>
    );
  }
}

export default connect(defaultSelector)(SchoolEditPage);