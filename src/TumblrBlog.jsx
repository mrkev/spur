import React from 'react';
import Post       from './post/Post.jsx';
import PostQuote  from './post/PostQuote.jsx';
import PostLink   from './post/PostLink.jsx';
import PostChat   from './post/PostChat.jsx';
import PostText   from './post/PostText.jsx';
import PostAudio  from './post/PostAudio.jsx';
import PostVideo  from './post/PostVideo.jsx';
import PostPhoto  from './post/PostPhoto.jsx';
import Pagination from './part/Pagination.jsx';
import lib from './lib/obj.jsx';

export default class TumblrBlog {
  constructor(props, options) {
    Object.keys(props).forEach(k => this[k] = props[k]);

    /** Portrait **/
    this.portrait = (function (size) {
      const supports = [16, 24, 30, 40, 48, 64, 96, 128, 512];
      size = size || 512;
      if (supports.indexOf(size) < 0)
        throw new Error('Size not supported');
      return this['PortraitURL-128'].replace(/_(\d+)\./, `_${size}.` );
    }).bind({'PortraitURL-128' : this['PortraitURL-128']});
    delete this['PortraitURL-128'];

    /** Pages + Ask + Submit **/

    // Ensures this.Pages exists and is an Array
    this.Pages = lib.obj2arr(this.Pages);

    if (this.AskEnabled) {
      this.Pages.push({
        URL: '/ask',
        Label: this.AskLabel,
      });
    }
    delete this.AskEnabled;
    delete this.AskLabel;

    if (this.SubmissionsEnabled) {
      this.Pages.push({
        URL: '/submit',
        Label: this.SubmitLabel,
      });
    }
    delete this.SubmissionsEnabled;
    delete this.SubmitLabel;

    this.description = lib.html_insert(this.Description);
    delete this.Description;

    /**
		Blog:
			- Title
			- Metadata
			- Index
				- Posts
				- Pagination
			- Content
				- Post
				- Pagination
		**/

    if (this.IndexPage) {
      this.Index = {};
      this.Index.Pagination = new Pagination(this.Pagination);
    }

    /** Content page **/
    if (this.PermalinkPage) {
      this.Content = {};
      if (this.PermalinkPagination) // Pages don't have pagination
        this.Content.Pagination = new Pagination(this.PermalinkPagination);
    }

    delete this.Pagination;
    delete this.IndexPage;
    delete this.PermalinkPagination;
    delete this.PermalinkPage;

    const index = !!this.Index;
    const perma = !!this.Content;

    this.HomePage = this.Index && this.Index.Pagination.CurrentPage === 1;

    this.PageType =
      (index) ? 'index' :
        (perma && this.Content.Pagination) ? 'post'
          : 'page';

    this.Posts = lib.obj2arr(this.Posts).map(p =>
      p.PostType === 'photo' ? new PostPhoto(p) :
        p.PostType === 'video' ? new PostVideo(p) :
          p.PostType === 'audio' ? new PostAudio(p) :
            p.PostType === 'quote' ? new PostQuote(p) :
              p.PostType === 'link'  ? new PostLink(p)  :
                p.PostType === 'chat'  ? new PostChat(p)  :
                  p.PostType === 'text'  ? new PostText(p)  :
                    new Post(p))
      .map(p => {
      // index, page, post
        p.Context = this.PageType;
        return p;
      });

    if (this.Index) { this.Index.Posts = this.Posts; }
    if (this.Content) { this.Content.Post = this.Posts[0]; }
    delete this.Posts;
  }
}
