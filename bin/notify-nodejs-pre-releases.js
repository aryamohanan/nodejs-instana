/*
 * (c) Copyright IBM Corp. 2024
 */

'use strict';

const slackToken = process.env.SLACK_TOKEN_NODEJS_TEAM;

const slackID = 'C07L6QGAHML';

const rcUrl = 'https://nodejs.org/download/rc/';
const nightlyUrl = 'https://nodejs.org/download/nightly/';
const slackApiUrl = 'https://slack.com/api/chat.postMessage';

async function sendSlackNotification(message) {
  try {
    const response = await fetch(slackApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${slackToken}`
      },
      body: JSON.stringify({
        channel: slackID,
        text: message
      })
    });

    const data = await response.json();
    if (data.ok) {
      console.log('Notification sent to Slack.');
    } else {
      console.error('Error sending notification to Slack:', data.error);
    }
  } catch (error) {
    console.error('Error sending notification to Slack:', error);
  }
}

function parseDateFromResponse(text, releaseType) {
  const releaseRegex =
    releaseType === 'nightly'
      ? /href="(v\d+\.\d+\.\d+-nightly\d+[^"]*)\/"\s*.*?(\d{2}-[A-Za-z]{3}-\d{4})/g
      : /href="(.*?v\d+\.\d+\.\d+-rc\.\d+\/)"\s*.*?(\d{2}-[A-Za-z]{3}-\d{4})/g;

  const releases = [];
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = releaseRegex.exec(text)) !== null) {
    const releaseName = match[1];
    const releaseDate = match[2];
    // date string (e.g., 13-Oct-2020)
    const dateParts = releaseDate.split('-');
    const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    releases.push({ release: releaseName, date });
  }

  return releases;
}

async function checkForUpdates() {
  try {
    const [rcResponse, nightlyResponse] = await Promise.all([fetch(rcUrl), fetch(nightlyUrl)]);
    const [rcText, nightlyText] = await Promise.all([rcResponse.text(), nightlyResponse.text()]);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const rcReleases = parseDateFromResponse(rcText, 'rc');
    const nightlyReleases = parseDateFromResponse(nightlyText, 'nightly');

    const filterRecentReleases = releases =>
      releases.filter(item => item.date && item.date >= oneWeekAgo && item.date <= now).sort((a, b) => b.date - a.date);

    const recentRcReleases = filterRecentReleases(rcReleases);
    const recentNightlyReleases = filterRecentReleases(nightlyReleases);

    let message = '';

    if (recentRcReleases.length) {
      const latestRc = recentRcReleases[0].release;
      message +=
        `🚀 A new Node.js RC version is available: <${rcUrl}${latestRc}|\`${latestRc}\`> ` +
        '! Check it out for the latest features and fixes.\n';
    }

    if (recentNightlyReleases.length) {
      const latestNightly = recentNightlyReleases[0].release;
      message +=
        `🥳 The latest Node.js nightly release is here: <${nightlyUrl}${latestNightly}|\`${latestNightly}\`> ` +
        'Give it a try!\n';
    }

    if (message) {
      await sendSlackNotification(message);
    } else {
      console.log('No updates in the last week.');
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

checkForUpdates();
