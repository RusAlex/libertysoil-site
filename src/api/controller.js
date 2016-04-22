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
export default class ApiController {
  constructor (bookshelf) {
    this.bookshelf = bookshelf;
  }

  async test(ctx) {
    ctx.body = 'test message in response';
  }

  /**
   * Returns 50 most popular hashtags sorted by post count.
   * Each hashtag in response contains post_count.
   */
  async getTagCloud(ctx) {
    let Hashtag = this.bookshelf.model('Hashtag');

    try {
      let hashtags = await Hashtag
        .collection()
        .query(qb => {
          qb
            .select('hashtags.*')
            .count('hashtags_posts.* as post_count')
            .join('hashtags_posts', 'hashtags.id', 'hashtags_posts.hashtag_id')
            .groupBy('hashtags.id')
            .orderBy('post_count', 'DESC');
        })
        .fetch({require: true});

      ctx.status = 200;
      ctx.body = hashtags;
      console.log('hashtag assigned');
    } catch (e) {
      ctx.status = 500;
      ctx.body = {error: e.message};
      return;
    }
  }

}
