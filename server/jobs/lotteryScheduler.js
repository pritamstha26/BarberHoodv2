import { Op } from "sequelize";
import sequelize from "../config/db.js";
import { LotteryPoolModel } from "../models/model.js";
import { resolveLottery } from "../controllers/lotteryController.js";

class LotteryScheduler {
  constructor() {
    this.interval = null;
  }

  start() {
    this.processPendingLotteries();
    this.interval = setInterval(() => {
      this.processPendingLotteries();
    }, 60 * 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async processPendingLotteries() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const pendingSlots = await sequelize.query(
        `
        SELECT restaurant_id, booking_date, preferred_time_slot, COUNT(*) as count
        FROM lottery_pool
        WHERE status = 'pending'
          AND booking_date >= :today
          AND booking_date <= :tomorrow
        GROUP BY restaurant_id, booking_date, preferred_time_slot
        HAVING COUNT(*) >= 2
        `,
        {
          replacements: {
            today: today.toISOString().slice(0, 10),
            tomorrow: tomorrow.toISOString().slice(0, 10),
          },
          type: sequelize.QueryTypes.SELECT,
        },
      );

      for (const slot of pendingSlots) {
        try {
          const result = await resolveLottery(
            slot.restaurant_id,
            slot.booking_date,
            slot.preferred_time_slot,
          );

          if (result) {
            console.log(
              `[Lottery] Resolved restaurant ${slot.restaurant_id} on ${slot.booking_date} slot ${slot.preferred_time_slot}: ` +
              `winner user ${result.winner.userId} with chance ${result.winnerChance}`,
            );
          }
        } catch (error) {
          console.error(
            `[Lottery] Failed to resolve slot ${slot.restaurant_id} ${slot.booking_date} ${slot.preferred_time_slot}:`,
            error,
          );
        }
      }

      await LotteryPoolModel.update(
        { status: "expired" },
        {
          where: {
            status: "pending",
            booking_date: {
              [Op.lt]: today.toISOString().slice(0, 10),
            },
          },
        },
      );
    } catch (error) {
      console.error("[Lottery] Scheduler error:", error);
    }
  }
}

export const lotteryScheduler = new LotteryScheduler();