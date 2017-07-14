var  Yakuza = require('yakuza');
var Cheerio = require('cheerio');

Yakuza.scraper('articles');
Yakuza.agent('articles', 'techCrunch');
Yakuza.agent('articles', 'techCrunch').plan(['getArticlesList']);
Yakuza.task('articles', 'techCrunch', 'getArticlesList');

Yakuza.task('articles', 'techCrunch', 'getArticlesList').main(function (task, http, params) {
  http.get('www.repubblica.it', function (err, res, body) {
    var $, articleLinks;

    if (err) {
      task.fail(err, 'Request returned an error');
      return; // we return so that the task stops running
    }

    $ = cheerio.load(body);

    articleLinks = [];

    $('a').each(function ($article) {
      console.log("Pushing " + $article);
      articleLinks.push($article.attr('href'));
    });

    task.success(articleLinks); // Successfully return all article links found
  });
});

var job = Yakuza.job('articles', 'techCrunch');
job.enqueue('getArticlesList');

job.on('job:fail', function (response) {
  // Handle job failure
});

job.on('task:*:fail', function (response) {
  console.log(response.task.taskId + ' failed!');
});

job.on('task:*:success', function (response) {
  // Handle all successful tasks
});

job.on('task:login:fail', function (response) {
  console.log('Failed to log in');
});
//  http.get('https://www.skyscanner.net/transport/flights/rome/ath/170714/170715/', function (err, res, body) {
