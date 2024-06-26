import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  boxes: defineTable({
    active: v.boolean(),
    position: v.array(v.number()),
    user: v.id("users"),
  }),
  winners: defineTable({
    user: v.id("users"),
    score: v.number(),
  }),
  rounds: defineTable({
    timeLeft: v.number(),
  }),
  users: defineTable({
    // this is UserJSON from @clerk/backend
    clerkUser: v.any(),
    color: v.string(),
  }).index("by_clerk_id", ["clerkUser.id"]),
});
