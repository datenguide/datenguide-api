"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _apolloServerExpress = require("apollo-server-express");

var _graphqlServerExpress = require("graphql-server-express");

var _schema = _interopRequireDefault(require("./schema"));

var _resolvers = _interopRequireDefault(require("./resolvers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = async app => {
  const server = new _apolloServerExpress.ApolloServer({
    typeDefs: _schema.default,
    resolvers: (0, _resolvers.default)(app)
  }); // apollo / apollo playground

  server.applyMiddleware({
    app
  }); // graphiql

  app.use('/graphiql', (0, _graphqlServerExpress.graphiqlExpress)({
    endpointURL: '/graphql'
  }));
};

exports.default = _default;