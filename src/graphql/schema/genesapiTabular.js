import { gql } from 'apollo-server-express'

export default gql`
  scalar JSON

  enum Type {
      integer
      string
  }

  type Field {
      name: String!,
      type: Type!
  }

  type Row {
      index: Int,
      region_id: String,
      year: String,
      measure: String,
      value: Int,
      statistic: String
  }

  type Schema {
      fields: [Field]
  }

  type TableResult {
    schema: Schema
    data: JSON!
  }

  input RegionSelection {
    region: [String]
    parent: String
    level: Int
  }

  input DimensionSelection {
    name: String!
    values: [String]
  }

  input MeasureSelection {
    id: String!
    dimensions: [DimensionSelection]
  }

  enum Layout {
    long
    region
    time
  }

  enum Labels {
    id
    name
    both
  }

  enum Format {
    csv
    tsv
    json
  }


  type Query {
    table(
      region: [String]
      level: [Int]
      measures: [MeasureSelection]
      time: String
      layout: Layout
      labels: Labels
      format: Format
    ): TableResult!
  }
`
