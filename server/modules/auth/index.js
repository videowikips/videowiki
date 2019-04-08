import routes from './routes';
import passportInit from './config/passport/init';
import services from './services';

const passport = passportInit.init();
services.rabbitmq.initRabbitMQ();

export default {
  passport,
  routes: routes(passport),
};
