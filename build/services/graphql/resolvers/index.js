"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _schema = _interopRequireDefault(require("../schema/schema.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = app => {
  const attributeResolver = attributeId => {
    return (obj, args) => {
      return _lodash.default.filter(obj[attributeId], args).map(o => _lodash.default.merge(o, {
        value: o[attributeId].value,
        id: o._id,
        source: _schema.default[attributeId].source
      }));
    };
  };

  const attributeResolvers = Object.assign({}, ...Object.keys(_schema.default).map(key => ({
    [key]: attributeResolver(key)
  })));

  const fetchData = async (args, fields) => {
    const argumentToQuery = {
      id: value => ({
        region_id: value
      }),
      nuts: value => ({
        nuts: value
      }),
      parent: value => ({
        parent: {
          $prefix: value
        }
      })
    };

    const argumentsToQuery = args => Object.keys(args).reduce((acc, key) => {
      return Object.assign({}, acc, argumentToQuery[key](args[key]));
    }, {});

    return app.service('genesapi').find({
      query: _objectSpread({}, argumentsToQuery(args), {
        $exists: fields.filter(f => f !== 'name')
      })
    });
  };

  const getFieldsFromInfo = info => {
    return info.fieldNodes[0].selectionSet.selections.map(s => s.name.value).filter(f => !['id', 'name'].includes(f));
  };

  const resolvableAttributes = (result, fields) => fields.map(f => ({
    [f]: result
  }));

  return {
    Query: {
      region: async (obj, args, context, info) => {
        const fields = getFieldsFromInfo(info);
        const data = await fetchData(args, fields);
        const region = await app.service('regions').get(args.id);
        return _lodash.default.merge(region, ...resolvableAttributes(data, fields));
      },
      regions: async (obj, args, context, info) => {
        const fields = getFieldsFromInfo(info);
        const data = await fetchData(args, fields);
        const regions = await app.service('regions').find({
          query: args
        });
        return regions.map(region => _lodash.default.merge(region, ...resolvableAttributes(data, fields)));
      }
    },
    Region: attributeResolvers
  };
};

exports.default = _default;