var Yakuza = require('yakuza');
var Cheerio = require('cheerio');
var Log4js = require( "log4js" );
var Config = require('config');

Log4js.configure( "./config/log4js.json" );
logger = Log4js.getLogger("file-appender");

Yakuza.scraper('articles');
Yakuza.agent('articles', 'techCrunch');
Yakuza.agent('articles', 'techCrunch').plan(['getArticlesList']);
Yakuza.task('articles', 'techCrunch', 'getArticlesList');

Yakuza.task('articles', 'techCrunch', 'getArticlesList').main(function (task, http, params) {
  http.get('www.repubblica.it', function (err, res, body) {
    var $, articleLinks;

    if (err) {
      logger.error('Request returned an error');
      task.fail(err, 'Request returned an error');
      return; // we return so that the task stops running
    }

    $ = cheerio.load(body);

    articleLinks = [];

    $('a').each(function ($article) {
      logger.info("Pushing " + $article);
      articleLinks.push($article.attr('href'));
    });

    task.success(articleLinks); // Successfully return all article links found
  });
});

var job = Yakuza.job('articles', 'techCrunch');
job.enqueue('getArticlesList');

job.on('job:fail', function (response) {
  logger.error("Job failed");
});

job.on('task:*:fail', function (response) {
  logger.error("Task failed");
  logger.error(response.task.taskId + ' failed!');
});

job.on('task:*:success', function (response) {
  logger.info("Task successful");
});

job.on('task:login:fail', function (response) {
  logger.error('Task failed');
});
//  http.get('https://www.skyscanner.net/transport/flights/rome/ath/170714/170715/', function (err, res, body) {
