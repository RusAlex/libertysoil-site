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
import { form as inform } from 'react-inform';

import Button from '../button';
import Message from '../message';
import Messages from '../messages';

class HashtagEditForm extends React.Component {
  static displayName = 'HashtagEditForm';

  static propTypes = {
    fields: PropTypes.shape({
      description: PropTypes.shape().isRequired
    }).isRequired,
    form: PropTypes.shape({
      forceValidate: PropTypes.func.isRequired,
      isValid: PropTypes.func.isRequired,
      onValues: PropTypes.func.isRequired
    }).isRequired,
    saveHandler: PropTypes.func.isRequired,
    hashtag: PropTypes.shape({
      name: PropTypes.string
    }).isRequired
  };

  componentDidMount() {
    const {
      form,
      hashtag
     } = this.props;

    form.onValues(hashtag);
  }

  submitHandler = (event) => {
    event.preventDefault();

    const { fields, form } = this.props;

    form.forceValidate();
    if (!form.isValid()) {
      return;
    }

    let theForm = event.target;

    this.props.saveHandler(
      theForm.id.value,
      fields.description.value
    );
  };

  render() {
    const {
      fields,
      form,
      hashtag,
      processing,
      messages,
      triggers
    } = this.props;
    
    let defaultDescription;
    if (hashtag.more) {
      defaultDescription = hashtag.more.description;
    }

    return (
      <form onSubmit={this.submitHandler}>
        <input name="id" type="hidden" value={hashtag.id} />

        <div className="layout__row">
          <label className="layout__block layout__row layout__row-small" htmlFor="description">Description</label>
          <textarea
            className="input input-block input-textarea content layout__row layout__row-small"
            defaultValue={defaultDescription}
            {...fields.description}
          />

          {fields.description.error &&
            <Message message={fields.description.error} />
          }
        </div>

        <div className="layout__row layout__space-triple">
          <div className="layout layout__grid layout-align_right">
            <Button type="submit" className="button-green" disabled={!form.isValid()} title="Save" waiting={processing}/>
          </div>
        </div>
        <Messages messages={messages} removeMessage={triggers.removeMessage}/>
      </form>
    );
  }
}

const fields = ['description'];
const validate = values => {
  const { description } = values;
  const errors = {};

  if (description && description.length > 100) {
    errors.description = 'There are too many symbols in the description';
  }

  return errors;
};

const WrappedHashtagEditForm = inform({
  fields,
  validate
})(HashtagEditForm);

export default WrappedHashtagEditForm;