import { createServer } from 'http';
import { PORT, CLIENT_URL, ENVIRONMENT, db, MONGODB_URI, WORKER, APP_NAME } from './config';
import { logger } from './api/utils';
import { app } from './api/bootstrap';
import cluster from 'cluster';
import { cpus } from 'os';
let numCores = cpus().length;

/** Create Server
 * @var server
 */
const server = createServer(app);
let workers: any[] = [];
/** Start Server */
if (!WORKER) {
  server.listen(PORT, async () => {
    logger.info(
      `😀 ${APP_NAME} server running on '${ENVIRONMENT}' environment, port '${PORT}'`
    );
    await db.connectMongoDB(MONGODB_URI);
  });
} 
if (WORKER) {
  if (numCores > 4) numCores = numCores / 2;
  logger.info(numCores);
  const setupWorkerProcesses = () => {
    for (let i = 0; i < numCores; i++) {
      // creating workers and pushing reference in an array
      // these references can be used to receive messages from workers
      workers.push(cluster.fork());

      // to receive messages from worker process
      workers[i].on('message', function (message: any) {
        logger.info(message);
      });
    }
    cluster.on('online', function (worker) {
      logger.info('Worker ' + worker.process.pid + ' is listening');
    });

    cluster.on('exit', function (worker, code, signal) {
      logger.info('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
      logger.info('Starting a new worker');
      cluster.fork();
      workers.push(cluster.fork());
      // to receive messages from worker process
      workers[workers.length - 1].on('message', function (message: any) {
        logger.info(message);
      });
    });
  };
  const setUpExpress = () => {
    server.listen(PORT, async () => {
      logger.info(
        `😀 Application running in '${ENVIRONMENT}' environment on port '${PORT}'`
      );
      await db.connectMongoDB(MONGODB_URI);
    });
  };

  /**
   * Setup server either with clustering or without it
   * @param isClusterRequired
   * @constructor
   */
  const setupServer = (isClusterRequired: boolean) => {
    // if it is a master process then call setting up worker process
    if (isClusterRequired && cluster.isPrimary) {
      setupWorkerProcesses();
    } else {
      // to setup server configurations and share port address for incoming requests
      setUpExpress();
    }
  };
  setupServer(true);
}

export { server };
