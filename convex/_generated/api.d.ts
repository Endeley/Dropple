/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentMemory from "../agentMemory.js";
import type * as agentQueue from "../agentQueue.js";
import type * as aiPolicies from "../aiPolicies.js";
import type * as animations from "../animations.js";
import type * as apiUsage from "../apiUsage.js";
import type * as assets from "../assets.js";
import type * as audioAssets from "../audioAssets.js";
import type * as auditLogs from "../auditLogs.js";
import type * as backlog from "../backlog.js";
import type * as categories from "../categories.js";
import type * as collections from "../collections.js";
import type * as componentBehaviors from "../componentBehaviors.js";
import type * as componentInstances from "../componentInstances.js";
import type * as components_ from "../components.js";
import type * as cron from "../cron.js";
import type * as debateRooms from "../debateRooms.js";
import type * as deployments from "../deployments.js";
import type * as editorStates from "../editorStates.js";
import type * as events from "../events.js";
import type * as knowledge from "../knowledge.js";
import type * as messages from "../messages.js";
import type * as modules from "../modules.js";
import type * as orgs from "../orgs.js";
import type * as packs from "../packs.js";
import type * as pageTransitions from "../pageTransitions.js";
import type * as presence from "../presence.js";
import type * as recommendations from "../recommendations.js";
import type * as render from "../render.js";
import type * as sensory from "../sensory.js";
import type * as sprints from "../sprints.js";
import type * as stateMachines from "../stateMachines.js";
import type * as styleMemory from "../styleMemory.js";
import type * as styles from "../styles.js";
import type * as system from "../system.js";
import type * as tags from "../tags.js";
import type * as teams from "../teams.js";
import type * as templateEvents from "../templateEvents.js";
import type * as templateStats from "../templateStats.js";
import type * as templates from "../templates.js";
import type * as themes from "../themes.js";
import type * as updateAssetMetadata from "../updateAssetMetadata.js";
import type * as users from "../users.js";
import type * as workspace from "../workspace.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentMemory: typeof agentMemory;
  agentQueue: typeof agentQueue;
  aiPolicies: typeof aiPolicies;
  animations: typeof animations;
  apiUsage: typeof apiUsage;
  assets: typeof assets;
  audioAssets: typeof audioAssets;
  auditLogs: typeof auditLogs;
  backlog: typeof backlog;
  categories: typeof categories;
  collections: typeof collections;
  componentBehaviors: typeof componentBehaviors;
  componentInstances: typeof componentInstances;
  components: typeof components_;
  cron: typeof cron;
  debateRooms: typeof debateRooms;
  deployments: typeof deployments;
  editorStates: typeof editorStates;
  events: typeof events;
  knowledge: typeof knowledge;
  messages: typeof messages;
  modules: typeof modules;
  orgs: typeof orgs;
  packs: typeof packs;
  pageTransitions: typeof pageTransitions;
  presence: typeof presence;
  recommendations: typeof recommendations;
  render: typeof render;
  sensory: typeof sensory;
  sprints: typeof sprints;
  stateMachines: typeof stateMachines;
  styleMemory: typeof styleMemory;
  styles: typeof styles;
  system: typeof system;
  tags: typeof tags;
  teams: typeof teams;
  templateEvents: typeof templateEvents;
  templateStats: typeof templateStats;
  templates: typeof templates;
  themes: typeof themes;
  updateAssetMetadata: typeof updateAssetMetadata;
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
