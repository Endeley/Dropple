/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentQueue from "../agentQueue.js";
import type * as assets from "../assets.js";
import type * as backlog from "../backlog.js";
import type * as components_ from "../components.js";
import type * as cron from "../cron.js";
import type * as debateRooms from "../debateRooms.js";
import type * as events from "../events.js";
import type * as messages from "../messages.js";
import type * as presence from "../presence.js";
import type * as recommendations from "../recommendations.js";
import type * as sprints from "../sprints.js";
import type * as styleMemory from "../styleMemory.js";
import type * as styles from "../styles.js";
import type * as templates from "../templates.js";
import type * as themes from "../themes.js";
import type * as users from "../users.js";
import type * as workspace from "../workspace.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentQueue: typeof agentQueue;
  assets: typeof assets;
  backlog: typeof backlog;
  components: typeof components_;
  cron: typeof cron;
  debateRooms: typeof debateRooms;
  events: typeof events;
  messages: typeof messages;
  presence: typeof presence;
  recommendations: typeof recommendations;
  sprints: typeof sprints;
  styleMemory: typeof styleMemory;
  styles: typeof styles;
  templates: typeof templates;
  themes: typeof themes;
  users: typeof users;
  workspace: typeof workspace;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  stack_auth: {};
};
