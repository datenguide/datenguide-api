# datenguide-api

[![Build Status](https://travis-ci.com/datenguide/datenguide-api.svg?branch=master)](https://travis-ci.com/datenguide/datenguide-api)

> Datenguide API server

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

```
yarn install
yarn dev
```

## Using the API

Try the GraphQL playground: https://api.datengui.de/graphql

Query for a single region:

```graphql
{
  region(id: "11") {
    id
    name
    WAHL09(year: 2017, PART04: CDU) {
      year
      value
      PART04
    }
  }
}
```

Query across all regions:

```graphql
# default page size is 10 , maximum page size is 1000
# ⚠️ pagination starts a 0

{
  allRegions(page: 0, itemsPerPage: 10) {
    regions(parent: "11") {
      id
      name
      WAHL09(year: 2017, PART04: B90_GRUENE) {
        value
        year
        PART04
      }
    }
    page
    itemsPerPage
    total
  }
}
```

Using argument arrays:

```graphql
{
  region(id: "11") {
    id
    name
    WAHL09(year: [2012, 2017], PART04: [DIELINKE, SPD]) {
      year
      value
      PART04
    }
  }
}
```

Using argument filters:

```graphql
# ⚠️ Filter arguments are currently Strings, not Enum Values
# if filters and regular arguments for a value attribute are both present, their results will be merged with 'or'

{
  region(id: "11") {
    id
    name
    WAHL09(year: 2017, filter: { PART04: { nin: ["AFD", "CDU"] } }) {
      year
      value
      PART04
    }
  }
}
```

### General remarks

nuts only goes from 1-3, 'Gemeinden' can be selected with lau=1 or lau=2. Currently they both return the same thing: everything below nuts level. (because lau=1 is not implemented yet).

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
