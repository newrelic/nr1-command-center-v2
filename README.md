[![New Relic Experimental header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Experimental.png)](https://opensource.newrelic.com/oss-category/#new-relic-experimental)

[![Snyk](https://snyk.io/test/github/newrelic-experimental/nr1-command-center/badge.svg)](https://snyk.io/test/github/newrelic-experimental/nr1-command-center)

# Command Center (nr1-command-center-v2)

## Usage

This application aggregates incidents, anomalies, and issues across many accounts to provide a single, operational/reliability view. It also provides analytics in order to improve alert conditions and anomalies configured.

## Features
- Per account snapshot of issue/anomaly counts
- Holistic, filterable/exportable view of open incidents, issues, and anomalies across many accounts.
- Auto refresh configuration of open incidents, issues, and anomalies
- Persistent links to correlate with individual incidents and issues
- Acknowledge and close issues/incidents directly in list view
- Analytics for total issue count, accumulated issue minutes, MTTR, and % of issues closed under 5 minutes.
- Configurable linked dashboard that can be used as a tool for operational/reliability reviews. [Template provided here - this can be added to all accounts](dashboards/ops_template.json)

## Screenshots

![Overview](screenshots/overview.png)
![Open Incidents](screenshots/open_incidents.png)
![Open Issues](screenshots/open_issues.png)
![Analytics](screenshots/analytics.png)
![Drilldown](screenshots/drilldown.png)

## Getting Started
First, ensure that you have [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [NPM](https://www.npmjs.com/get-npm) installed. If you're unsure whether you have one or both of them installed, run the following command(s) (If you have them installed these commands will return a version number, if not, the commands won't be recognized):

```bash
git --version
npm -v
```

Next, install the [NR1 CLI](https://one.newrelic.com/launcher/developer-center.launcher) by going to [this link](https://one.newrelic.com/launcher/developer-center.launcher) and following the instructions (5 minutes or less) to install and setup your New Relic development environment.

Next, clone this repository and update `config.json` with your accountId (**NOTE: This should match the profile you are serving to**). To run the code locally against your New Relic data, execute the following commands:

```bash
nr1 nerdpack:clone -r https://github.com/newrelic-experimental/nr1-command-center-v2.git
cd nr1-command-center-v2
nr1 nerdpack:serve
```

Visit [https://one.newrelic.com/?nerdpacks=local](https://one.newrelic.com/?nerdpacks=local), navigate to the Nerdpack, and :sparkles:

## Configuration
Update `config.json` located under `./nerdlets/` with your accountId, refreshRate (in milliseconds), and optional template dashboard name that will be linked to each account (dashboard needs to exist in each account) within the Analytics tab. The refreshRate variable controls how often the `Open*` pages are refreshed automatically.

## Deploying this Nerdpack

Open a command prompt in the nerdpack's directory and run the following commands.

```bash
# To create a new uuid for the nerdpack so that you can deploy it to your account:
# nr1 nerdpack:uuid -g [--profile=your_profile_name]

# To see a list of API keys / profiles available in your development environment:
# nr1 profiles:list

nr1 nerdpack:publish [--profile=your_profile_name]
nr1 nerdpack:deploy [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
nr1 nerdpack:subscribe [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
```

Visit [https://one.newrelic.com](https://one.newrelic.com), navigate to the Nerdpack, and :sparkles:

## Support

<a href="https://github.com/newrelic?q=nrlabs-viz&amp;type=all&amp;language=&amp;sort="><img src="https://user-images.githubusercontent.com/1786630/214122263-7a5795f6-f4e3-4aa0-b3f5-2f27aff16098.png" height=50 /></a>

This project is actively maintained by the New Relic Labs team. Connect with us directly by [creating issues](../../issues) or [asking questions in the discussions section](../../discussions) of this repo.

We also encourage you to bring your experiences and questions to the [Explorers Hub](https://discuss.newrelic.com) where our community members collaborate on solutions and new ideas.

New Relic has open-sourced this project, which is provided AS-IS WITHOUT WARRANTY OR DEDICATED SUPPORT.

## Security

As noted in our [security policy](https://github.com/newrelic/nr-labs-pages/security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

## Contributing

Contributions are welcome (and if you submit a Enhancement Request, expect to be invited to contribute it yourself :grin:). Please review our [Contributors Guide](CONTRIBUTING.md).

Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource@newrelic.com.

## Open Source License

This project is distributed under the [Apache 2 license](LICENSE).
