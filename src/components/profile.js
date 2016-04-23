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

import User from './user';
import FollowButton from './follow-button';
import UpdatePicture from './update-picture/update-picture';

import { getUrl, URL_NAMES } from '../utils/urlGenerator';
import { AVATAR_SIZE, PROFILE_HEADER_SIZE } from '../consts/profileConstants';

export default class ProfileHeader extends React.Component {
  static displayName = 'ProfileHeader';

  unsaved = false;

  state = {
    avatar: null,
    head_pic: null
  };

  _getNewPictures() {
    if (!this.unsaved) {
      return undefined;
    }

    let pictures = {};
    if (this.state.avatar) {
      pictures.avatar = this.state.avatar.production;
    }
    if (this.state.head_pic) {
      pictures.head_pic = this.state.head_pic.production;
    }

    return pictures;
  }

  _clearPreview() {
    this.setState({ avatar: null, head_pic: null });
    this.unsaved = false;
  }

  addAvatar = async ({ production, preview }) => {
    if (production) {
      let _production = { picture: production.picture, crop: production.crop };
      _production.resize = { width: AVATAR_SIZE.width };

      this.setState({avatar: {production: _production, preview}});
      this.unsaved = true;
    } else {
      this.setState({avatar: {production: null, preview: null}});
    }
  };

  addHeaderPicture = async ({ production, preview }) => {
    if (production) {
      let _production = { picture: production.picture, crop: production.crop };

      if (_production.crop.width > PROFILE_HEADER_SIZE.BIG.width) {
        _production.scale = { wRatio: PROFILE_HEADER_SIZE.BIG.width / _production.crop.width };
      } else {
        _production.scale = { wRatio: PROFILE_HEADER_SIZE.NORMAL.width / _production.crop.width };
      }

      this.setState({head_pic: {production: _production, preview}});
      this.unsaved = true;
    } else {
      this.setState({head_pic: {production: null, preview: null}});
    }
  };

  render() {
    const {
      user,
      current_user,
      editable,
      i_am_following,
      following,
      followers
    } = this.props;
    
    let picture = '/assets/d18659acda9afc3dea60b49d71d689ae.jpg';
    let name = user.username;
    let summary = '';

    let modalName = <span className="font-bold">{name}</span>;
    if (user.more) {
      if (user.more.firstName || user.more.lastName) {
        name = `${user.more.firstName} ${user.more.lastName}`;
        modalName = [
          <span className="font-bold">{name}</span>,
          ` (${user.username})`
        ];
      }

      if (user.more.summary) {
        summary = user.more.summary;
      }

      if (user.more.head_pic) {
        picture = user.more.head_pic.url;
      }
    }

    if (this.state.head_pic) {
      picture = this.state.head_pic.preview.url;
    }

    let avatarPreview;
    if (this.state.avatar) {
      avatarPreview = this.state.avatar.preview;
    }

    let followingCount;
    let followersCount;

    if (following && following[user.id] && following[user.id].length) {
      // if anonym user, then do not show "Manage followers" links next to follow counters
      if (!current_user || (current_user && current_user.id != user.id)) {
        followingCount = (
          <div>
            {following[user.id].length}<br />
            Following
          </div>
        );
      } else {
        followingCount = (
          <div>
            {following[user.id].length}<br />
            <Link to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)}>Following</Link>
          </div>
        );
      }

    }

    if (followers && followers[user.id] && followers[user.id].length) {
      // if anonym user, then do not show "Manage followers" too
      if (!current_user || (current_user && current_user.id != user.id)) {
        followersCount = (
          <div>
            {followers[user.id].length}<br />
            Followers
          </div>
        );
      } else {
        followersCount = (
          <div>
            {followers[user.id].length}<br />

            <Link to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)}>Followers</Link>
          </div>
        );
      }

    }

    name = name.trim();

    return (
      <div ref={c => this.root = c} className="profile" style={{backgroundImage: `url('${picture}')`}}>
        <div className="profile__body">
          <div className="layout__row">
            <div className="layout__grid">
              <div className="layout__grid_item layout__grid_item-wide">
                <User
                  user={user}
                  editorConfig={editable ? {flexible: false, onUpdateAvatar: this.addAvatar} : false}
                  avatarPreview={avatarPreview}
                  avatarSize="120"
                  isRound={true}
                  hideText={true}
                />
              </div>
              {editable &&
                <div className="layout__grid_item layout__grid_item-wide layout-align_right update_picture__container">
                  <UpdatePicture
                    what="profile background"
                    where={modalName}
                    preview={PROFILE_HEADER_SIZE.PREVIEW}
                    flexible={true}
                    limits={{min: PROFILE_HEADER_SIZE.NORMAL, max: PROFILE_HEADER_SIZE.BIG}}
                    onSubmit={this.addHeaderPicture}
                  />
                </div>
               }
             </div>
          </div>
          <div className="layout__row">
            <div className="layout__grid">
              <div className="layout__grid_item layout__grid_item-wide">
                <div className="profile__title">{name}</div>
                <div className="profile__summary">{summary}</div>
              </div>
              <div className="layout__grid_item">
                {followingCount}
              </div>
              <div className="layout__grid_item">
                {followersCount}
              </div>
              <div className="layout__grid_item">
                <FollowButton active_user={current_user} user={user} following={i_am_following} triggers={this.props.triggers} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
