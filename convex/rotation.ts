import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const rotate = internalMutation({
  args: {},
  handler: async (ctx, {}) => {
    let now = new Date().getTime();
    let rotation = await ctx.db.query("rotation").first();
    let attributes;
    if (rotation === null) {
      let id = await ctx.db.insert("rotation", { x: 0, lastModified: now});
      attributes = {
        _id: id,
        x: 0,
        lastModified: now,
      };
    } else {
      attributes = rotation;
    }
    console.log(now, attributes.lastModified, now-attributes.lastModified);
    const newX = attributes.x + (now - attributes.lastModified);
    await ctx.db.patch(attributes._id, { x: newX, lastModified: now });
    await ctx.scheduler.runAfter(50, internal.rotation.rotate);
  },
});

export const get = query({
  args: { },
  handler: async (ctx, {} : {}) => {
    let rotation = await ctx.db.query("rotation").first();
    if (rotation !== null) {
      return rotation.x;
    } else {
      return 0;
    }
  },
});
