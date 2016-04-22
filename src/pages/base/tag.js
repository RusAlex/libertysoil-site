/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

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
import React, { PropTypes } from 'react';
import { values, clone } from 'lodash';

import {
  Page,
  PageMain,
  PageCaption,
  PageHero,
  PageBody,
  PageContent
}                       from '../../components/page';
import Header           from '../../components/header';
import MapboxMap        from '../../components/mapbox-map';
import HeaderLogo       from '../../components/header-logo';
import CreatePost       from '../../components/create-post';
import TagBreadcrumbs   from '../../components/breadcrumbs/tag-breadcrumbs';
import Footer           from '../../components/footer';
import TagHeader        from '../../components/tag-header';
import Sidebar          from '../../components/sidebar';
import SidebarAlt       from '../../components/sidebarAlt';
import AddedTags        from '../../components/post/added-tags';
import UpdatePicture    from '../../components/update-picture/update-picture';
import { TAG_SCHOOL, TAG_LOCATION, TAG_HASHTAG } from '../../consts/tags';
import { TAG_HEADER_SIZE } from '../../consts/tags';

function formInitialTags(type, value) {
  switch (type) {
    case TAG_SCHOOL:
      return { schools: value };
    case TAG_HASHTAG:
      return { hashtags: value };
    case TAG_LOCATION:
      return { geotags: value };
    default:
      return {};
  }
}

function getPageCaption(type, name) {
  let caption;
  switch (type) {
    case TAG_LOCATION: {
      caption = [`${name} `, <span className="page__caption_highlight">Education</span>];
      break;
    }
    default:
      caption = name;
  }

  return (
    <PageCaption>
      {caption}
    </PageCaption>
  );
}

function GeotagPageHero({ geotag }) {
  let type = geotag.type;
  let location = {
    lat: geotag.lat,
    lon: geotag.lon
  };

  // A lot of admin divisions don't have lat/lon. Attempt to take coords from the country.
  if (!(location.lat && location.lon) && geotag.country) {
    type = 'Country';
    location.lat = geotag.country.lat;
    location.lon = geotag.country.lon;
  }

  let zoom;
  switch (type) {
    case 'Planet': zoom = 3; break;
    case 'Continent': zoom = 4; break;
    case 'Country': zoom = 5; break;
    case 'AdminDivision1': zoom = 6; break;
    case 'City': zoom = 12; break;
    default: zoom = 10;
  }

  if (location.lat && location.lon) {
    return (
      <PageHero>
        <MapboxMap
          className="page__hero_map"
          frozen
          viewLocation={location}
          zoom={zoom}
        />
      </PageHero>
    );
  }

  return <PageHero src="/images/hero/welcome.jpg" />;
}

function TagPageHero({ type, tag, src, editable, onSubmit, limits }) {
  switch (type) {
    case TAG_HASHTAG:
    case TAG_SCHOOL:
      return (
        <PageHero src={src}>
          {editable &&
            <div className="layout__grid layout-align_vertical layout-align_center layout__grid-full update_picture__container">
              <div className="layout__grid_item">
                <UpdatePicture
                  what="header image"
                  where={(<span className="font-bold">{tag.name}</span>)}
                  onSubmit={onSubmit}
                  limits={limits} />
              </div>
            </div>
          }
        </PageHero>
      );
    case TAG_LOCATION:
      return <GeotagPageHero geotag={tag} />;
    default:
      return <script />;
  }
}

export default class BaseTagPage extends React.Component {
  static displayName = 'BaseTagPage';

  static propTypes = {
    tag: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    actions: PropTypes.shape({
      resetCreatePostForm: PropTypes.func,
      updateCreatePostForm: PropTypes.func
    }).isRequired
  };

  state = {
    form: false,
    production: null,
    preview: null
  };

  postsAmount = null;
  defaultPicture = '/images/hero/welcome.jpg';

  componentWillMount() {
    this.postsAmount = this.props.postsAmount;

    if (this.props.tag.more && this.props.tag.more.head_pic) {
      this.defaultPicture = this.props.tag.more.head_pic.url;
    }
  }

  _getNewPicture() {
    if (this.state.production) {
      return this.state.production;
    }

    return undefined;
  }

  addPicture = async ({ production, preview }) => {
    if (production) {
      let _preview = { src: preview.src };
      let _production = { picture: production.picture, crop: production.crop };

      if (_production.crop.width > TAG_HEADER_SIZE.BIG.width) {
        _production.scale = { wRatio: TAG_HEADER_SIZE.BIG.width / _production.crop.width };
      } else {
        _production.scale = { wRatio: TAG_HEADER_SIZE.NORMAL.width / _production.crop.width };
      }

      this.setState({production: _production, preview: _preview});
    } else {
      this.setState({production: null, preview: null});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.form) {
      if (this.postsAmount != nextProps.postsAmount) {
        this.setState({ form: false });
      }
    }
    this.postsAmount = nextProps.postsAmount;
  }

  componentWillUnmount() {
    this.props.actions.resetCreatePostForm();
  }

  toggleForm = () => {
    if (!this.state.form) {
      const { tag, type } = this.props;
      this.props.actions.resetCreatePostForm();
      this.props.actions.updateCreatePostForm(formInitialTags(type, [tag]));
    }

    this.setState({ form: !this.state.form });
  };

  render() {
    const {
      is_logged_in,
      current_user,
      actions,
      triggers,
      type,
      tag,
      postsAmount,
      editable
    } = this.props;

    let name = tag.url_name;
    if (tag.name) {
      name = tag.name;
    }

    const pageCaption = getPageCaption(type, name);

    let pic;
    if (this.state.preview) {
      pic = clone(this.state.preview);
    } else {
      pic = { src: this.defaultPicture };
    }

    let createPostForm;
    let addedTags;
    if (is_logged_in) {
      if (this.state.form) {
        createPostForm = (
          <CreatePost
            actions={actions}
            allSchools={values(this.props.schools)}
            defaultText={this.props.create_post_form.text}
            triggers={triggers}
            userRecentTags={current_user.recent_tags}
            {...this.props.create_post_form}
          />
        );
        addedTags = <AddedTags {...this.props.create_post_form} />;
      }
    }

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user}>
          <HeaderLogo small />
          <TagBreadcrumbs type={type} tag={tag} />
        </Header>

        <Page>
          <Sidebar current_user={current_user} />
          <PageMain className="page__main-no_space">
            {pageCaption}
            <TagPageHero
              type={type}
              tag={tag}
              editable={editable}
              onSubmit={this.addPicture}
              {...pic} />
            <PageBody className="page__body-up">
              <TagHeader
                is_logged_in={is_logged_in}
                tag={tag}
                type={type}
                current_user={current_user}
                triggers={triggers}
                newPost={this.toggleForm}
                postsAmount={postsAmount}
                editable={editable}
              />

            </PageBody>
            <PageBody className="page__body-up">
              <PageContent>
                <div className="layout__space-double"></div>
                <div className="layout__row">
                  {createPostForm}
                  {this.props.children}
                </div>
              </PageContent>
              <SidebarAlt>
                {addedTags}
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>

        <Footer/>
      </div>
    );
  }
}
