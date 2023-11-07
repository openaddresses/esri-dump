# CHANGELOG

## Emoji Cheatsheet
- :pencil2: doc updates
- :bug: when fixing a bug
- :rocket: when making general improvements
- :white_check_mark: when adding tests
- :arrow_up: when upgrading dependencies
- :tada: when adding new features

## Version History

### v5.0.0

- :tada: Support the `format` tag in the Schema for Dates
- :rocket: Return Dates as ISO formatted strings to conform to schema

### v4.6.2

- :bug: Fix the way headers were appended

### v4.6.1

- :arrow_up: Update base deps

### v4.6.0

- :bug: If `meta.count` was 0 the unable to determine count error would be thrown incorrectly

### v4.5.0

- :rocket: Use user provided `where` parameter where possible

### v4.4.1

- :bug: Include built version

### v4.4.0

- :bug: Cleaner error messages in the CLI
- :tada: Set `feature.id` as the OID field
- :bug: Fix double `f=json` when fetching metadata causing a failure

### v4.3.2

- :bug: Don't throw on metadata.fields not being present

### v4.3.1

- :bug: Include dist directory for now

### v4.3.0

- :rocket: Add initial `discovery` mode for finding all services and layers on a server

### v4.2.1

- :bug: Output Schema to STDOut when using CLI

### v4.2.0

- :bug: Use `gzip` Encoding by default

### v4.1.1

- :bug: Fix JS build

### v4.1.0

- :rocket: Be more specific about type of returned schema

### v4.0.0

- :tada: Adds a `schema` mode to allow parsing a Feature Layer as JSON Schema
- :rocket: **Breaking** Update the CLI to have a "mode" that must be specified
- :rocket: Automatically rewind GeoJSON Polygons to enforce the Right-Hand-Rule
- :rocket: Add Support for `--header` param in CLI

### v3.1.0

- :rocket: Fix ESRI Dump Bin

### v3.0.1

- :bug: Include Types Field & Build for ES

### v3.0.0

- :rocket: Migrate library to TypeScript
- :tada: Add support for `params` and `headers` properties in initial config

### v2.0.0

- :tada: Rewrite as ES Module
- :tada: Add BBOX & Iter Fetch Methodologies
