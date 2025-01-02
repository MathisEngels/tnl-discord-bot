import moment from "moment-timezone";
import mainLogger from "../logger";

const logger = mainLogger.child({ scope: "SaurollScheduler" });

class SaurollScheduler {
  private ping: () => void;
  private roll: (chestNumber: number) => void;
  private readonly interval = 60 * 150; // 150 minutes = 2.5 hours
  private readonly referenceDate = moment("4 Dec 2024 15:20:00 GMT");
  private readonly pingPeriod = 8 * 60; // Can send a ping to up 8min before the night cycle
  private readonly rollDuration = 5 * 60; // 5min
  private readonly chestCount = 6;
  private readonly rollPeriod = this.rollDuration * (this.chestCount - 1); // 25min of rolls
  private readonly nightCycleDuration = this.pingPeriod + this.rollPeriod;

  constructor(ping: () => void, roll: (chestNumber: number) => void) {
    logger.debug("Initializing SaurollScheduler...");

    this.ping = ping;
    this.roll = roll;

    this.init();

    logger.debug("SaurollScheduler initialized.");
  }

  private init() {
    const nextNightCycle = this._nextNightCycle();
    const prevNightCycle = nextNightCycle.clone().subtract(this.interval, "seconds");

    logger.info(`Previous night cycle: ${prevNightCycle.format("YYYY-MM-DD HH:mm:ss")}`);
    logger.info(`Next night cycle: ${nextNightCycle.format("YYYY-MM-DD HH:mm:ss")}`);

    const timeSinceLastNightCycle = moment().diff(prevNightCycle, "seconds");
    if (timeSinceLastNightCycle < this.nightCycleDuration) {
      logger.info("Night cycle already started. Starting rolls...");

      this.nightCycle();
    }

    const initialTimeout = this._nextTimeout();
    this.schedule(initialTimeout);
  }

  private schedule(timeout: number) {
    logger.debug(`Scheduling next night cycle in ${timeout}ms`);
    
    setTimeout(() => {
      this.nightCycle();

      const newTimeout = this._nextTimeout();
      this.schedule(newTimeout);
    }, timeout);
  }

  private _nextNightCycle() {
    const now = moment();
    const nextNightCycle = this.referenceDate.clone();

    while (nextNightCycle.isBefore(now)) {
      nextNightCycle.add(this.interval, "seconds");
    }

    return nextNightCycle;
  }

  private _nextTimeout() {
    return this._nextNightCycle().diff(moment());
  }

  private nightCycle() {
    logger.info("Starting night cycle...");

    const nextNightCycle = this._nextNightCycle();
    const elapsed = this.interval - nextNightCycle.diff(moment(), "seconds");

    if (elapsed <= this.pingPeriod) {
      const timeToFirstRoll = this.pingPeriod - elapsed;

      this.ping();

      setTimeout(() => {
        this.startRolls();
      }, timeToFirstRoll * 1000);
    } else if (elapsed <= this.nightCycleDuration) {
      const timeSinceFirstRoll = elapsed - this.pingPeriod;

      const remainingRolls = this.chestCount - Math.ceil(timeSinceFirstRoll / this.rollDuration);
      const timeToNextRoll = this.rollDuration - (timeSinceFirstRoll % this.rollDuration);

      this.startRolls(remainingRolls, timeToNextRoll * 1000);
    }
  }

  private startRolls(numberOfRolls = 6, firstInterval = 0) {
    const rollInterval = this.rollDuration * 1000;

    for (let i = 0; i < numberOfRolls; i++) {
      setTimeout(() => {
        const nextNightCycle = this._nextNightCycle();
        const elapsed = this.interval - nextNightCycle.diff(moment(), "seconds");
        const timeSinceFirstRoll = elapsed - this.pingPeriod;
        const rollNumber = 1 + Math.floor(timeSinceFirstRoll / this.rollDuration);
        this.roll(rollNumber);
      }, firstInterval + i * rollInterval);
    }
  }
}

export default SaurollScheduler;
