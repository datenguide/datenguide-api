# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## Added
- `statistics` and `measures` GraphQL queries to inspect and query the data schema
- `children` field in `region` query 
- The server now downloads `info.json` on startup and imports the latest schema from GenesAPI `schema.json` instead of previously bundled and static `schema.json`
- Query and Schema tests

## Security
- CORS middleware to restrict CORS origins

## [0.1.0] - 2019-10-29
### Added
- Initial implementation of the Datenguide API server
- `region` and `allRegions` GraphQL queries
- Experimental complex filter arguments based on [sift](https://github.com/crcn/sift.js) filter syntax. 
- GraphQL Playground and GraphiQL Web UIs for interactive GraphQL queries
- HTML homepage for API server

[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/olivierlacan/keep-a-changelog/releases/tag/v0.0.1