"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _genesapi = _interopRequireDefault(require("./genesapi"));

var _graphql = _interopRequireDefault(require("./graphql"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = app => {
  app.configure(_genesapi.default);
  app.configure(_graphql.default);
};

exports.default = _default;