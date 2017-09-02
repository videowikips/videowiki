import { runBot } from './index';
import { CronJob } from 'cron';

const console = process.console;
const x = 1 ; // multiple by 24 hours 
const NumberOfArticlesPerUpdate = 30; // 30 to reduce memory consumption
var runnedTimes = 0;

var job = new CronJob({
  cronTime: '30 12 * * *',
  onTick: function() {
    // if runnded times is less than x, dont execute
    runnedTimes ++ ;
    if(runnedTimes >= x ){

        // run the script, clear running flag 
        console.log('Auto update bot spawned! getting to work!')
        runBot(NumberOfArticlesPerUpdate);
        runnedTimes = 0;

    } else {
        console.log('dont execute');
    }
    /*
     * Runs every weekday 
     * at 12:30:00 PM IST. 
     */
  },
  timeZone: 'Asia/Kolkata'
});
job.start();
console.log('Started cron job for bot at', Date());