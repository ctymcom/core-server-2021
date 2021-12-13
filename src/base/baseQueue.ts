import Queue, { Job, QueueSettings } from "bee-queue";
import config from "config";
import { EventEmitter } from "events";
import { Dictionary } from "lodash";

import logger from "../helpers/logger";
import redis from "../helpers/redis";

export abstract class BaseQueue extends EventEmitter {
  private _queues: Dictionary<Queue> = {};

  constructor(
    public name: string,
    public concurrency: number = 1,
    public options: QueueSettings = {}
  ) {
    super();
  }

  queue(id?: string) {
    if (!id) {
      id = config.util.getEnv("NODE_ENV") == "development" ? "dev" : "prod";
    }
    const isWorker = config.get<boolean>("job.isWorker");
    if (!this._queues[id]) {
      this._queues[id] = new Queue(this.name, {
        prefix: id,
        removeOnSuccess: true,
        removeOnFailure: true,
        redis: redis,
        isWorker: isWorker,
        ...this.options,
      });

      if (isWorker) {
        this._queues[id].process(this.concurrency, this.process.bind(this));
        const childLogger = logger.child({ _reqId: `${this.name}` });
        // Watch queue Status
        setInterval(() => {
          this._queues[id].checkHealth().then(({ active, waiting }) => {
            if (active > 0) {
              childLogger.info(`Processing [${active}/${waiting}]`);
            }
          });
        }, 60000); // 1 phút 1 lần

        // Check Stalled Job
        this._queues[id].checkStalledJobs(60000, (err, stalled) => {
          if (stalled > 0) {
            childLogger.info(`Check Stalled Job (${stalled})`);
          }
        });
      }
    }
    return this._queues[id];
  }

  protected abstract process(job: Job<any>): Promise<any>;
}
