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
import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import TagCloud from './../tag-cloud';
import * as TagType from '../../utils/tags';

export default class TagEditor extends React.Component {
  static displayName = 'TagsEditor';

  static propTypes = {
    locations: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string
    })),
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      url_name: PropTypes.string
    })),
    tags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    onDelete: PropTypes.func
  };

  static defaultProps = {
    locations: [],
    schools: [],
    tags: [],
    onDelete: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      locations: props.locations,
      schools: props.schools,
      tags: props.tags
    };
  }

  addLocation(location) {
    let state = _.pick(this.state, 'locations');

    state.tags.push(location);

    this.setState(state);
  }

  addSchool(school) {
    let state = _.pick(this.state, 'schools');

    state.schools.push(school);

    this.setState(state);
  }

  addTag(tag) {
    let state = _.pick(this.state, 'tags');

    state.tags.push(tag);

    this.setState(state);
  }

  getTags() {
    return this.state;
  }

  _handleDelete = (displayTag) => {
    let state = this.state;

    switch (displayTag.type) {
      case TagType.TAG_LOCATION: {
        // TODO: Locations

        break;
      }
      case TagType.TAG_SCHOOL: {
        _.remove(state.schools, school => school.url_name === displayTag.urlId);

        break;
      }
      case TagType.TAG_HASHTAG: {
        _.remove(state.tags, tag => tag.name === displayTag.urlId);

        break;
      }
    }

    this.setState(state);
  };

  render() {
    let {
      locations,
      schools,
      tags
    } = this.state;

    let tagCloudProps = {locations, schools, tags};

    let shouldRender = schools.length > 0 || locations.length > 0 || tags.length > 0;

    if (!shouldRender) {
      return null;
    }

    return (
      <div className="layout__row">
        <div className="layout__row">
          Added:
        </div>
        <div className="layout__row add_tag_modal__added_tags">
          <TagCloud
            deletable
            onDelete={this._handleDelete}
            {...tagCloudProps}
          />
        </div>
      </div>
    );
  }
}