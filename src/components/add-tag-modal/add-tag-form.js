import React, { PropTypes, Component } from 'react';

import AddGeotagForm from './add-geotag-form';
import AddHashtagForm from './add-hashtag-form';
import AddSchoolForm from './add-school-form';
import { TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL, IMPLEMENTED_TAGS } from '../../consts/tags';


export default class AddTagForm extends Component {
  static displayName = 'AddTagForm';

  static propTypes = {
    addedTags: PropTypes.shape({
      geotags: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string
      })),
      schools: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string
      })),
      hashtags: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string
      }))
    }),
    allSchools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    onAddGeotag: PropTypes.func.isRequired,
    onAddHashtag: PropTypes.func.isRequired,
    onAddSchool: PropTypes.func.isRequired,
    type: PropTypes.oneOf(IMPLEMENTED_TAGS).isRequired,
    userRecentTags: PropTypes.shape({
      geotags: PropTypes.array.isRequired,
      schools: PropTypes.array.isRequired,
      hashtags: PropTypes.array.isRequired
    }).isRequired,
    triggers: PropTypes.shape({
      checkSchoolExists: PropTypes.func.isRequired,
      checkGeotagExists: PropTypes.func.isRequired
    })
  };

  render() {
    let {
      addedTags: { geotags, schools, hashtags },
      allSchools,
      onAddGeotag,
      onAddHashtag,
      onAddSchool,
      type,
      userRecentTags,
      triggers
    } = this.props;

    switch (type) {
      case TAG_LOCATION:
        return <AddGeotagForm addedGeotags={geotags} onAddGeotag={onAddGeotag} triggers={triggers} userRecentGeotags={userRecentTags.geotags} />;
      case TAG_HASHTAG:
        return <AddHashtagForm addedHashtags={hashtags} onAddHashtag={onAddHashtag} userRecentHashtags={userRecentTags.hashtags} />;
      case TAG_SCHOOL:
        return <AddSchoolForm addedSchools={schools} allSchools={allSchools} onAddSchool={onAddSchool} triggers={triggers} userRecentSchools={userRecentTags.schools} />;
      default:
        return false;
    }
  }
}
