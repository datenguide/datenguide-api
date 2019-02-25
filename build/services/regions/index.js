"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _names = _interopRequireDefault(require("./names.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const regions = Object.keys(_names.default).map(key => ({
  id: key,
  name: _names.default[key]
}));
const queryToFilters = {
  nuts: value => region => {
    return region.id.length === [null, 2, 3, 5, 8][value] && value < 5 && region.id !== 'DG';
  },
  parent: value => region => region.id !== value && region.id.startsWith(value)
};

var _default = async app => {
  const service = {
    find: async params => {
      const filters = Object.keys(params.query).map(key => {
        return r => r.filter(queryToFilters[key](params.query[key]));
      });
      return _lodash.default.flow(...filters)(regions);
    },
    get: async id => regions.find(o => o.id === id.toString())
  };
  app.use('/regions', service);
  app.service('regions').hooks({
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