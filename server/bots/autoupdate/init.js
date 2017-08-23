import * as schedule from 'node-schedule';
import { runBot } from './index';

var j = schedule.scheduleJob('1 * * * * *', function(){
  runBot(1);
});