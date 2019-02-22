"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _feathersElasticsearch = _interopRequireDefault(require("feathers-elasticsearch"));

var _elasticsearch = require("elasticsearch");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = app => {
  app.set('elasticsearch', new _elasticsearch.Client({
    host: app.get('elasticsearch').host,
    apiVersion: app.get('elasticsearch').version
  }));
  const genesapiService = (0, _feathersElasticsearch.default)({
    Model: app.get('elasticsearch'),
    paginate: {
      default: 10,
      max: 50
    },
    elasticsearch: {
      index: 'genesapi',
      type: 'doc'
    },
    esVersion: '6.0'
  });
  app.use('/genesapi', genesapiService);
  app.service('genesapi').hooks({
    before: {
      all: [],
      find: []
    },
    after: {
      all: [],
      find: []
    },
    error: {
      all: [],
      find: []
    }
  }).hooks({
    after: {
      all: []
    }
  });
};

exports.default = _default;