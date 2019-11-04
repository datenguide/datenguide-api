import { gql } from 'apollo-server-express'

export default gql`
    type Unit {
        measure_name_de: String!
        title_de: String!
        type: String!
        GRUND_ME: String!
        UMR_ME: String!
        POTENZ: Int!
        FAKTOR: Float!
        measure_name_en: String!
        title_en: String!
    }

    type DimensionValue {
        title_de: String!
        title_en: String!
        name: String!
        POS_NR: Int!
        dimension_name: String!
        value_id: String!
        key: String!
    }

    type Dimension {
        name: String!
        title_de:String!
        measure_type: String!
        atemporal: Boolean!,
        meta_variable: Boolean!,
        valid_from: String!
        GLIED_TYP: String!
        STD_SORT: String!
        summable: Boolean!,
        title_en: String!,
        values: [DimensionValue]!
    }

    type Measure {
        id: String!
        name: String!
        title_de: String!
        statistic_name: String!
        statistic_title_de: String!
        statistic_title_en: String!
        statistic_description_de: String
        definition_de: String
        measure_type:String!
        atemporal: Boolean!
        meta_variable: Boolean!
        valid_from: String!
        summable: Boolean!
        title_en: String!
        # values ?
        units: [Unit]!
        dimensions: [Dimension]
        region_levels: [Int]!

    }

    type Statistic {
        title_de: String!
        title_en: String!
        description_de: String!
        valid_from: String!
        periodicity: String!
        name: String!
        measures: [Measure]!
    }

    input MeasureDescription {
        statisticId: String!
        measureId: String!
    }

    type Query {
        statistics(ids: [String]): [Statistic]!
        measures(ids: [MeasureDescription]): [Measure]!
    }
`
