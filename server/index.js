require('dotenv').config();
const port = process.env.PORT || 3000;
const app = require('express')();
const axios = require('axios');
const request = require('request');
const fs = require('fs');

function extractConfigData(html) {
  var index,
      start = 'ytplayer.config = ',
      end = ';ytplayer.load';

  index = html.indexOf(start);
  if (index === -1) {
    return '';
  }

  html = html.slice(index + start.length);

  index = html.indexOf(end);
  if (index === -1) {
    return '';
  }

  return html.slice(0, index);
}

app.get('/', (req, res, next) => {
  axios.get('https://www.youtube.com/watch?v=jTohNTggC60')
    .then((response) => {
      const data = JSON.parse(extractConfigData(response.data));

      const formats = data.args.adaptive_fmts.split(',')
        .filter((format) => {
          return format.indexOf('type=audio') >= 0;
        })
        .map((format) => {
          const informations = format.split('&');

          return {
            url: informations
              .filter((info) => !info.indexOf('url='))
              .map((url) => decodeURIComponent(url.split('=')[1]))
              .toString(),
            bitrate: informations
              .filter((info) => !info.indexOf('bitrate='))
              .map((bitrate) => bitrate.split('=')[1])
              .toString()
          }
        })
        .sort((prev, next) => {
          return parseInt(prev.bitrate) < parseInt(next.bitrate);
        });

      return formats[0].url;
    })
    .then((video) => {
      console.log(video);

      request.get(video)
        .pipe(fs.createWriteStream('son.mp3'))
          .on('close', function () {
            console.log('File written!');
            next();
          });

        .on('response', (res) => {
          const file = fs.createWriteStream('bootstrap.zip')
            .on('close', () => {
              console.log('File written !');
            });

          res.pipe(file)

          res.on('err', function() {
            console.log("error occured.....");
            next();
          })

          res.on('end', () => {
            console.log('Done');
            next();
          });
        })
      axios.get(video, { responseType: 'stream', onDownloadProgress: function (e) { console.log(e) }})

    })
    .catch((error) => {
      console.log('error1', error);
    });
});

app.listen(port);
