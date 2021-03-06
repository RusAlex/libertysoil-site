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
import { Link } from 'react-router';
import _ from 'lodash';

export default class TagLine extends React.Component {
  static displayName = "TagLine"

  static propTypes = {
    tags: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string,
      name: React.PropTypes.string
    })),
    schools: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string,
      name: React.PropTypes.string,
      url_name: React.PropTypes.string,
    }))
  };

  render () {
    let {
        tags,
        schools
      } = this.props;

    if ((!tags || !schools) || (tags.length == 0 && schools.length == 0)) {
      return <script/>;
    }

    let schoolBlocks = schools.map(school => {
      console.log(school);
      return (
        <Link to={`/s/${school.url_name}`} className='tag school' key={`school-${school.id}`}>
          {school.name}
        </Link>
      )
    });

    let tagBlocks = tags.map(tag => {
      return (
        <Link to={`/tag/${tag.name}`} className='tag' key={`tag-${tag.id}`}>
          {tag.name}
        </Link>
      )
    });

    return (
      <div className="tags">
        {schoolBlocks}
        {tagBlocks}
      </div>
    );
  }
}
