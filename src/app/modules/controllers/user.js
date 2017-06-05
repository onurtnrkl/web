define(function (require, exports, module) {
  var AjaxModel = require('../models/ajax');
  var eventBus = require('eventbus');

  module.exports = {
    'getProfileWithSlug': function (id, callback) {
      var ajaxModel = new AjaxModel();
      ajaxModel.changeUrl('/users/profile/' + id);

      ajaxModel.fetch({
        success: function (model, response) {
          callback(response.data);
        }
      });
    },
    'getUserWithSlug': function (id, callback) {
      var ajaxModel = new AjaxModel();
      ajaxModel.changeUrl('/users/' + id);

      ajaxModel.fetch({
        success: function (model, response) {
          callback(response.data);
        }
      });
    },
    'doLogin': function (data, callback) {
      var ajaxModel = new AjaxModel();
      ajaxModel.changeUrl('/sessions');

      ajaxModel.save(data, {
        success: function (model, response) {
          callback(response.data);
        }
      });
    },
    'check-token': function (data, callback) {
      var ajaxModel = new AjaxModel();
      ajaxModel.changeUrl('/sessions/check');

      ajaxModel.save({}, {
        success: function (model, response) {
          if (response.data.isAlive) {
            eventBus.emit('unread', response.data.unread);
          }

          callback(response.data.isAlive);
        }
      });
    },
    'logout': function (data, callback) {
      var ajaxModel = new AjaxModel();
      ajaxModel.set('notId', +new Date());
      ajaxModel.changeUrl('/sessions');

      ajaxModel.destroy({
        url: ajaxModel.urlRoot(),
        success: function (model, response) {
          callback();
        }
      });
    },
    'register': function (data, callback) {
      var ajaxModel = new AjaxModel();
      ajaxModel.changeUrl('/users');

      ajaxModel.save(data, {
        success: function (model, response) {
          callback(response.data);
        }
      });
    },
    'changeMail': function (data, callback) {
      var ajaxModel = new AjaxModel();
      ajaxModel.changeUrl('/users/change-mail');

      ajaxModel.save(data, {
        success: function (model, response) {
          callback(response);
        }
      });
    },
    'changePassword': function (data, callback) {
      var ajaxModel = new AjaxModel();
      ajaxModel.changeUrl('/users/change-password');

      ajaxModel.save(data, {
        success: function (model, response) {
          callback(response);
        }
      });
    },
    'activateMail': function (token, callback) {
      var ajaxModel = new AjaxModel();
      ajaxModel.changeUrl('/users/activate-mail/' + token);

      ajaxModel.fetch({
        success: function (model, response) {
          callback(response);
        }
      });
    },
    'activate': function (token, callback) {
      var ajaxModel = new AjaxModel();
      ajaxModel.changeUrl('/activate/' + token);

      ajaxModel.fetch({
        success: function (model, response) {
          callback(response);
        }
      });
    }
  };
});