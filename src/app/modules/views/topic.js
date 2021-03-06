define(function (require, exports, module) {
  var $ = require('jquery');
  var Backbone = require('backbone');
  var TopicTemplate = require('template!../../templates/topic');
  var PagerTemplate = require('template!../../templates/components/pager');
  var topicController = require('../controllers/topic');
  var ComposeComponent = require('./components/compose');
  var EntryItemComponent = require('./components/entry-item');
  var storage = require('storage');
  var app = require('app');
  var cache = require('cache');
  var moment = require('moment');
  var utils = require('utils');
  var notification = require('notification');

  module.exports = Backbone.View.extend({
    events: {
      'change #page': 'handleChangePage',
      'click .topic_edit': 'handleClickTopicEdit'
    },

    handleChangePage: function (e) {
      e.preventDefault();
      var page = $(e.target).val();
      window.router.navigate('/' + this.topicUrl + '--' + this.topicId + '/' + page, true);
    },

    handleClickTopicEdit: function (e) {
      e.preventDefault();

      if (this.topic) {
        notification.prompt('yeni başlık', this.topic.get('title'), (function (new_title) {
          if (new_title) {
            var id = this.topic.get('id');
            var length = new_title.length;

            if (length > 0 && length < 51 && utils.title(new_title)) {
              this.topic.clear({silent: true});
              this.topic.set('id', id);
              this.topic.save({title: new_title}, {
                success: function (res) {
                  window.router.navigate('/' + res.get('slug') + '--' + res.get('id'), true);
                  $('h1.topic_title > a').text(res.get('title'));
                  notification.info('böyle daha iyi sanki');
                }
              });
            } else {
              notification.error('yakışmadı');
            }
          }
        }).bind(this), {ok: 'böyle olsun', cancel: 'kalsın o halde'});
      }
    },

    setTitleAndDescription: function (text, entry) {
      document.title = text + ' - saü sözlük';
      $('[name="description"]').attr('content', entry ? entry.get('text') : 'hmm');
      $('[name="twitter:title"]').attr('content', text);
      $('[name="twitter:description"]').attr('content', entry ? entry.get('text') : 'hmm');
    },

    renderCompose: function (model, entries) {
      this.composeComponent = new ComposeComponent({model: model, entries: entries});
      $(this.el).find('.pager').after(this.composeComponent.render().el);
    },

    goEntry: function (model) {
      window.router.navigate('/entry/' + model.get('id'), true);
    },

    generatePager: function () {
      $(this.el).find('.pager').html(PagerTemplate({
        id: this.topicId,
        slug: this.topicUrl,
        current_page: this.currentPage,
        total_page: this.totalPage
      }));
    },

    handleDestroyEntry: function (model, collection) {
      if (!collection.length) {
        window.router.navigate('/', true);
      }
    },

    reloadPageMeta: function () {
      var prevEl = $('<link id="prev" rel="prev" href="http://sausozluk.net/' + this.topicUrl + '--' + this.topicId + '/' + ( this.currentPage - 1) + '">');
      var nextEl = $('<link id="next" rel="next" href="http://sausozluk.net/' + this.topicUrl + '--' + this.topicId + '/' + ( this.currentPage + 1) + '">');

      if (this.currentPage !== 1) {
        $('head').append(prevEl);
      }

      if (this.currentPage !== this.totalPage) {
        $('head').append(nextEl);
      }
    },

    render: function (url, id, page) {
      this.topicUrl = url;
      this.topicId = id;
      this.currentPage = page ? parseInt(page) : 1;
      topicController.getTopicByIdAndPage(this.topicId, this.currentPage, (function (topic) {
        var json = topic.toJSON();
        this.topic = topic;
        json.site = location.origin;
        json.isMod = storage.permission > 0;
        json.single = false;

        $(this.el).html(TopicTemplate(json));

        this.setTitleAndDescription(topic.get('title'), topic.entries ? topic.entries.models[0] : null);
        this.totalPage = topic.get('total_page');

        this.entriesEl = $(this.el).find('.entries');

        topic.entries.on('add', this.goEntry, this);
        topic.entries.on('destroy', this.handleDestroyEntry, this);

        topic.entries.forEach((function (model) {
          var item = new EntryItemComponent({model: model});
          this.entriesEl.append(item.render().el);
        }).bind(this));

        this.generatePager();

        if (storage.username) {
          this.renderCompose(topic, topic.entries);
        }

        this.reloadPageMeta();
      }).bind(this));
    }
  });
});
