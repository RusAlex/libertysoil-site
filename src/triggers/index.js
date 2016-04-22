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
import {
  addError
} from '../actions';

const SET_TAG_CLOUD = 'SET_TAG_CLOUD';

function setTagCloud(hashtags) {
  return {
    type: SET_TAG_CLOUD,
    hashtags
  }
}


export class ActionsTrigger {
  client;
  dispatch;

  constructor(client, dispatch) {
    this.client = client;
    this.dispatch = dispatch;
  }

  loadTagCloud = async () => {
    console.log('triggres');
    // try {
    //   let result = await this.client.tagCloud();
    //   console.log('loaded cloud');
    //   // this.dispatch(setTagCloud(result));
    // } catch (e) {
    //   console.log(e);
    //   this.dispatch(addError(e.message));
    // }
  };

}
