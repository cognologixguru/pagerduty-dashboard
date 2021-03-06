PROJECT NOT MAINTAINED
=============================

Pagerduty has added a v2 of their API and will be discontinuing support for v1 on July 6, 2017 ([v2 FAQ](https://v2.developer.pagerduty.com/docs/api-v2-frequently-asked-questions), [migration guide](https://v2.developer.pagerduty.com/docs/migrating-to-api-v2)). The dashboard may continue to work past that date.

This project is using the `v1` endpoint. The changes required should be quite small (probably just updating `server/services/api.js`). I am unable to properly test any modifications against the new API since I no longer have access to a PagerDuty account.

If you are interested in the project, I would be happy to accept pull requests or transfer ownership of the project.

PagerDuty Dashboard
=============================

[![Dependency Status](https://david-dm.org/gondek/pagerduty-dashboard.svg)](https://david-dm.org/gondek/pagerduty-dashboard)
[![devDependency Status](https://david-dm.org/gondek/pagerduty-dashboard/dev-status.svg)](https://david-dm.org/gondek/pagerduty-dashboard#info=devDependencies)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)
[![Build Status](https://travis-ci.org/gondek/pagerduty-dashboard.svg?branch=master)](https://travis-ci.org/gondek/pagerduty-dashboard)

[![PagerDuty Dashboard screenshot](/doc/screenshot.png?raw=true)](/doc/screenshot-full.png?raw=true)

Grabs services from [PagerDuty](http://www.pagerduty.com/), groups them, and then highlights issues.
For details on the grouping process, refer to the "Conventions" section below.

## Setup

1. Install [Node.js](https://nodejs.org/)** and [Gulp](http://gulpjs.com/)
2. Checkout/download this repository. The `master` branch is always in a stable/ready-to-go state.
3. Install dependencies: `npm install`
4. Copy `config.sample.json` to `config.json` in the `server` folder and customize the values
  - For a demo or testing, leave `useMockData: true`
  - To enable API access, fill in `apiSubdomain` and `apiKey` and set `useMockData: false`
  - To set how often the dashboard polls PagerDuty, change `updateInterval` (in seconds)
  - `serverPort` and `basePath` determine the address to access the dashboard: `<ipAddress>:<serverPort>/<basePath>`
5. Build the front-end/client: `gulp`
6. Start the back-end/server: `node server/main.js`

During development, running `gulp dev` will restart the server and/or run builds when files change.

** Development and testing is done against the latest version of Node. The actual app should easily work on older versions of Node (eg. 0.12), so the only thing that determines the version needed are the dependencies in `package.json`.

## Custom View Configuration

To configure how the dashboard functions, click the gear icon in the bottom left corner. Then note down or bookmark the generated URL to have the settings you chose applied when you return.

## Conventions

These rules determine how the dashboard processes and displays data.

***[Click here](/doc/grouping-example.png?raw=true) for a screenshot with labels matching the descriptions below.***

### "Core" vs. "Other"

The services that should be separated into their own groups are "core" services. The rest are "other" services, which is the default state.

### Core Groups and Services

To add a service to a group, in the PagerDuty control panel:

1. Add `[dashboard-primary]` anywhere in the service's description.
2. Rename the service to use this convention: `<group>: <service>`. For example, if I wanted to put a "Server" service in the "Product Catalogue" group, I would name it "Product Catalogue: Server".

If a service has a name of `<group>: Site` or `<group>: Server`, it gets separated and enlarged. The two are meant to represent the overall/fundamental health of that group.

To add a group dependency, add `[dashboard-depends|list,of,dependencies]` to any service's description. Each comma-delimited entry can be a service name (`Some Service`) or a regular expression (`Caching Server (A|B|D)`). Dependencies of dependencies do not get added.

A core group's status is only determined from its services and not its dependencies.

### "Other" Groups and Services

If one or more of the remaining services are failing, the "other" group gets broken up into two pieces, one holding the offline/failing services and the other holding the online/okay services.

## Testing

- Protractor tests:
  1. Follow the setup steps
  2. Run `npm install -g protractor` to install [`protractor`](https://angular.github.io/protractor/) and `webdriver-manager`
  3. Install/update Selenium: `webdriver-manager update`
  4. Run Selenium: `webdriver-manager start`
  5. Run the server with the port, path and mock settings from `config.sample.json`
  6. Run `protractor test/protractor.js`
  - Note: Protractor tests are non-deterministic on older versions of node.
- Jasmine tests:
  1. Run `npm install -g jasmine`
  2. Run `jasmine JASMINE_CONFIG_PATH=test/jasmine.json`
