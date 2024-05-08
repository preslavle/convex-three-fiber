import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { computeScores } from "./boxes";

export const tick = internalMutation({
  args: { duration: v.number() },
  handler: async (ctx, { duration } : { duration: number }) => {
    let round = await ctx.db.query("rounds").first();
    if (round !== null) {
      round.timeLeft -= 1;
      if (round.timeLeft < 0) {
        // Record winner.
        let scores = await computeScores(ctx);
        if (scores.length > 0) {
          await ctx.db.insert("winners", { user: scores[0].userId, score: scores[0].score })
        }
        // Reset round
        await ctx.db.replace(round._id, { timeLeft: duration });
        // Delete all boxes.
        let boxes = await ctx.db.query("boxes").collect();
        for (const box of boxes) {
          await ctx.db.delete(box._id);
        }
      } else {
        await ctx.db.replace(round._id, round);
      }
      await ctx.scheduler.runAfter(1000, internal.rounds.tick, { duration });
    }
  },
});

export const startRound = internalMutation({
  args: { duration: v.number() },
  handler: async (ctx, { duration } : { duration: number }) => {
    for (const round of await ctx.db.query("rounds").collect()) {
      await ctx.db.delete(round._id);
    }
    await ctx.db.insert("rounds", { timeLeft: duration });
    await ctx.scheduler.runAfter(0, internal.rounds.tick, { duration });
  },
});

export const getTimeLeft = query({
  args: {},
  handler: async (ctx, {}) => {
    const round = await ctx.db.query("rounds").first();
    return round?.timeLeft;
  },
});
