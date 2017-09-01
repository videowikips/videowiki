import { runBot } from './index';
import { CronJob } from 'cron';

const x = 1 ; // multiple by 24 hours 
const NumberOfArticlesPerUpdate = 50;
var runnedTimes = 0;

var job = new CronJob({
  cronTime: '00 30 00 * * *',
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
     * Runs every weekday (Monday through Friday)
     * at 11:30:00 AM. It does not run on Saturday
     * or Sunday.
     */
  },
  start: true,
  timeZone: 'Asia/Kolkata'
});
job.start();
