var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var Twit = require('twit')

// Credentials
var twitter = require('./config/twitter')
var tone = require('./config/tone');

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


setInterval(() => {
  T.get('statuses/user_timeline', options, (err, data) => {
    if (lastTweet !== data[0].text) {
      lastTweet = data[0].text;
      tone_analyzer.tone({text: lastTweet}, (err, tone) => {
              console.log(lastTweet);
        if(err) {console.log(err)}
        else {console.log(JSON.stringify(tone, null, 2))}
      });
    }
  });

}, 1000);
