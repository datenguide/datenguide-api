"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _apolloServerExpress = require("apollo-server-express");

var _schema = _interopRequireDefault(require("./schema.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mapAll = (obj, fn) => Object.keys(obj).map(key => fn(key, obj[key])).join('\n');

const argumentToField = (id, {
  name
}) => `
"${name}"
${id}: String
`;

const attributeToType = (id, {
  args
}) => `
type ${id}Attribute {
  "Interne eindeutige ID"
  id: String
  "Jahr des Stichtages"
  year: String
  "Wert"
  value: String
  "Quellenverweis zur GENESIS Regionaldatenbank"
  source: Source
  ${mapAll(args, argumentToField)}
}
`;

const argumentToArgument = arg => `${arg}: String`;

const attributeToField = (id, {
  name,
  description,
  source,
  args
}) => `
"""
**${name}**
*aus GENESIS-Statistik "${source.title_de}" ${source.name})*
${description || ''}                                         
"""
${id}(year: String, ${mapAll(args, argumentToArgument)}): [${id}Attribute]
`;

const schema = `
type Source {
  title_de: String
  valid_from: String
  periodicity: String
  name: String
  url: String
}

${mapAll(_schema.default, attributeToType)}

type Region {
  "Regionalschlüssel"
  id: String
  "Name"
  name: String
  ${mapAll(_schema.default, attributeToField)}
}

"Graphql-API zum Datenbestand der GENESIS-Datenbank \\"Regionalstatistik\\""
type Query {
  "Detail-Endpunkt zur Abfrage exakt einer Region"
  region(
    "Regionalschlüssel"
    id: String!
  ): Region
  "Listen-Endpunkt zur Abfrage mehrerer Regionen"
  regions(
    """
    **Filter Regionen nach NUTS-Ebene.**
    *Optionen:*           
    1 – Bundesländer
    2 – Regierungsbezirke / statistische Regionen
    3 – Kreise / kreisfreie Städte
    4 – Gemeinden (LAU 1 / LAU 2)
    """
    nuts: Int
    "Filter Regionen nach ID (Regionalschlüssel) der Elternregion"
    parent: String
  ): [Region!]
}
`;

var _default = _apolloServerExpress.gql`
  ${schema}
`;

exports.default = _default;