import { mutation, query } from "./_generated/server";
import { mustGetCurrentUser, userById } from "./users";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { UserJSON } from "@clerk/backend";

export const list = query(async (ctx) => {
  const cubes = await ctx.db.query("boxes").collect();
  return Promise.all(
    cubes.map(async (cube) => {
      // For each cube in this channel, fetch the `User` who created it and
      // use its color.
      const user = await userById(ctx, cube.user);
      return {
        color: user ? user.color : "orange",
        ...cube,
      };
    })
  );
});

export const getScores = query(async (ctx) => {
  const cubes = await ctx.db.query("boxes").collect();
  const scores = new Map<Id<"users">, number>();;
  for (const cube of cubes) {
    const oldScore = scores.get(cube.user) ?? 0;
    const delta = cube.active ? 1 : -1;
    scores.set(cube.user, oldScore + delta);
  }
  let results = await Promise.all(
    [...scores.entries()].map(async ([userId, score]) => {
      const user = await userById(ctx, userId);
      return {
        userId: userId,
        name: user ? `${user.clerkUser.first_name} ${user.clerkUser.last_name}` : "deleted user",
        score,
      };
    })
  );
  results.sort((a, b) => {
    if (a.score == b.score) {
      return 0;
    }
    return a.score < b.score ? -1 : 1;
  })
});


export const add = mutation({
  args: {},
  handler: async (ctx, {}) => {
    const user = await mustGetCurrentUser(ctx);

    let boxes = await ctx.db.query("boxes").collect();

    for (const dim of [2, 4, 8, 16, 32]) {
      for (let x = 0; x < dim; x += 1) {
        for (let y = 0; y < dim; y += 1) {
          for (let z = 0; z < dim; z += 1) {
              if (!boxes.find((b: any) => Math.abs(b.position[0] - x) < 0.1 && Math.abs(b.position[1] - y) < 0.1 && Math.abs(b.position[2] - z) < 0.1)) {
              const box = { active: false, user: user._id, position: [x, y, z] };
              await ctx.db.insert("boxes", box);
              return;
            }
          }
        }
      }
    }
  },
});

export const setActive = mutation({
  args: { id: v.id("boxes"), active: v.boolean() },
  handler: async (ctx, { id, active } : { id: Id<"boxes">, active: boolean }) => {
    await ctx.db.patch(id, { "active": active });
  },
});

