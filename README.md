[![New Relic One Catalog Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/New_Relic_One_Catalog_Project.png)](https://opensource.newrelic.com/oss-category/#new-relic-one-catalog-project)

[![Snyk](https://snyk.io/test/github/newrelic/nr1-command-center/badge.svg)](https://snyk.io/test/github/newrelic/nr1-command-center)

# Incident Command Center (nr1-command-center-v2)

## Usage

This application aggregates alert events and issues across many accounts to provide a single, operational/reliability view. It also provides analytics in order to improve alert conditions and anomalies configured.

## Features
- Per account snapshot of alert event/issue counts
- Holistic, filterable/exportable view of open alert events and issues across many accounts
- Auto refresh (60 seconds) of open alert events and issues tabs
- Persistent links to external tickets or runbooks for individual alert events and issues
- Acknowledge and close issues/alert events directly in list view
- Analytics for total issue count, accumulated issue minutes, MTTR, and % of issues closed under 5 minutes - across all accounts
- Drilldown into `Alert Quality Management` dashboard if it exists in a given account. To install in a given account, follow [these docs](https://newrelic.com/instant-observability/alert-quality-management)

## Screenshots

![Overview](screenshots/overview.png)
![Open Incidents](screenshots/open_incidents.png)
![Open Issues](screenshots/open_issues.png)
![Analytics](screenshots/analytics.png)
![Drilldown](screenshots/drilldown.png)

## Dependencies

* [New Relic Alerts](https://docs.newrelic.com/docs/alerts/overview/) configured
* [AQM dashboard](https://newrelic.com/instant-observability/alert-quality-management) deployed to desired accounts (**optional**)

## Enabling this App

This app is available via the New Relic Catalog.

To enable it in your account:
1. Go to `Integrations & Agents > Apps and Visualizations` and search for "Command Center"
2. Click the `Incident Command Center` card, and then click the `Add this App` button to add it to your account(s)
3. Click `Open App` to launch the app (note: on the first time accessing the app, you may be prompted to enable it)

Once you have added your accounts, you can also open the app by:
1. Open the `Apps` left-hand navigation menu item (you may need to click on the `Add More` ellipsis if it doesn't show up by default)
2. In the `Your Apps` section, locate and click on the `Incident Command Center` card to open the app


#### Manual Deployment
If you need to customize the app, fork the codebase and follow the instructions on how to [Customize a Nerdpack](https://docs.newrelic.com/docs/new-relic-solutions/tutorials/customize-nerdpacks/). If you have a change you feel everyone can benefit from, please submit a PR!

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
