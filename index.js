var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var Twit = require('twit')
var IncomingWebhook = require('@slack/client').IncomingWebhook;

// Credentials
var twitter = require('./config/twitter')
var tone = require('./config/tone'); //Watson ToneAnalyzerV3 credentials
var slackWebHookURL =  require('./config/slack').slackWebHookURL || '';
var webhook = new IncomingWebhook(slackWebHookURL);

var T = new Twit({
  consumer_key: twitter.consumer_key,
  consumer_secret: twitter.consumer_secret,
  access_token: twitter.access_token,
  access_token_secret: twitter.access_token_secret,
  timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
})

const options = {
  screen_name: 'NYCTSubway',
  // screen_name: 'fabricebttest',
  count: 1
};

var tone_analyzer = new ToneAnalyzerV3({
  username: tone.username,
  password: tone.password,
  version_date: '2016-05-19'
});

let lastTweet;
const train = 'm';
const trainDirection = 'n/b';

const keywords = [
  train,
  'delays',
  trainDirection,
  'resumed',
  'jmz',
  'jm',
  'service change',
  'good',
  'resumed'
];

rateEmotion = (emotion) => {
  /*
    TODO: range and store data of emotion from NYCTSubway tweets.
          Compare those to the responses of the tweets they send out.
  */
  console.log(emotion)
}

shouldSendSlack = (tweet) => {
  let wordsIncluded = [];
  let sendSlackMessage;
  let isMyTrain = false;

  keywords.forEach((word) => {
    if (tweet.toLowerCase().includes(word)) {
      if (word === train) {
          isMyTrain = true;
      }

      wordsIncluded.push(word);
    }
  });

  sendSlackMessage = (wordsIncluded.length !== 0) && isMyTrain;
  return sendSlackMessage;
}

setInterval(() => {
  T.get('statuses/user_timeline', options, (err, data) => {
    if (lastTweet !== data[0].text) {
      lastTweet = data[0].text;
      if (shouldSendSlack(lastTweet)) {
        // SEND THE LASTTWEET TO MY SLACK MESSAGE
        webhook.send(lastTweet, function(err, res) {
          if (err) {
            console.log('Error:', err);
          }
        });
      }

      tone_analyzer.tone({text: lastTweet}, (err, tone) => {
        if(err) {console.log(err)}
        else {
          tone.document_tone.tone_categories.forEach((emotion) => {
            // rateEmotion(emotion);
          });
        }
      });
    }
  });

}, 1000);
