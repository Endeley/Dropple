/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activityEvents from "../activityEvents.js";
import type * as aiCredits from "../aiCredits.js";
import type * as aiJobs from "../aiJobs.js";
import type * as apiKeys from "../apiKeys.js";
import type * as appSettings from "../appSettings.js";
import type * as approvalComments from "../approvalComments.js";
import type * as approvals from "../approvals.js";
import type * as assets from "../assets.js";
import type * as audits from "../audits.js";
import type * as brandKits from "../brandKits.js";
import type * as classroomMemberships from "../classroomMemberships.js";
import type * as classrooms from "../classrooms.js";
import type * as creatorProfiles from "../creatorProfiles.js";
import type * as creditTransactions from "../creditTransactions.js";
import type * as designComments from "../designComments.js";
import type * as designInsights from "../designInsights.js";
import type * as designRevisions from "../designRevisions.js";
import type * as designs from "../designs.js";
import type * as ecommerceTools from "../ecommerceTools.js";
import type * as elements from "../elements.js";
import type * as integrations from "../integrations.js";
import type * as invoices from "../invoices.js";
import type * as layoutCategories from "../layoutCategories.js";
import type * as layouts from "../layouts.js";
import type * as licenses from "../licenses.js";
import type * as logoExports from "../logoExports.js";
import type * as logoProjects from "../logoProjects.js";
import type * as marketplaceProducts from "../marketplaceProducts.js";
import type * as marketplacePurchases from "../marketplacePurchases.js";
import type * as memberships from "../memberships.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as orderItems from "../orderItems.js";
import type * as orders from "../orders.js";
import type * as orgInvites from "../orgInvites.js";
import type * as orgMemberships from "../orgMemberships.js";
import type * as orgPacks from "../orgPacks.js";
import type * as organizations from "../organizations.js";
import type * as payouts from "../payouts.js";
import type * as plans from "../plans.js";
import type * as printTools from "../printTools.js";
import type * as scheduledPosts from "../scheduledPosts.js";
import type * as schedulerAccounts from "../schedulerAccounts.js";
import type * as seed from "../seed.js";
import type * as seedAll from "../seedAll.js";
import type * as seedCreatorTemplate from "../seedCreatorTemplate.js";
import type * as seedQuick from "../seedQuick.js";
import type * as seedTemplates from "../seedTemplates.js";
import type * as subscriptions from "../subscriptions.js";
import type * as teamInvites from "../teamInvites.js";
import type * as teamOrgPacks from "../teamOrgPacks.js";
import type * as teams from "../teams.js";
import type * as templateBrowser from "../templateBrowser.js";
import type * as templateData from "../templateData.js";
import type * as templates from "../templates.js";
import type * as templatesAdmin from "../templatesAdmin.js";
import type * as templatesSeed from "../templatesSeed.js";
import type * as test from "../test.js";
import type * as toolUsage from "../toolUsage.js";
import type * as tools from "../tools.js";
import type * as uploads from "../uploads.js";
import type * as usageMonthly from "../usageMonthly.js";
import type * as users from "../users.js";
import type * as videoTools from "../videoTools.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activityEvents: typeof activityEvents;
  aiCredits: typeof aiCredits;
  aiJobs: typeof aiJobs;
  apiKeys: typeof apiKeys;
  appSettings: typeof appSettings;
  approvalComments: typeof approvalComments;
  approvals: typeof approvals;
  assets: typeof assets;
  audits: typeof audits;
  brandKits: typeof brandKits;
  classroomMemberships: typeof classroomMemberships;
  classrooms: typeof classrooms;
  creatorProfiles: typeof creatorProfiles;
  creditTransactions: typeof creditTransactions;
  designComments: typeof designComments;
  designInsights: typeof designInsights;
  designRevisions: typeof designRevisions;
  designs: typeof designs;
  ecommerceTools: typeof ecommerceTools;
  elements: typeof elements;
  integrations: typeof integrations;
  invoices: typeof invoices;
  layoutCategories: typeof layoutCategories;
  layouts: typeof layouts;
  licenses: typeof licenses;
  logoExports: typeof logoExports;
  logoProjects: typeof logoProjects;
  marketplaceProducts: typeof marketplaceProducts;
  marketplacePurchases: typeof marketplacePurchases;
  memberships: typeof memberships;
  migrations: typeof migrations;
  notifications: typeof notifications;
  orderItems: typeof orderItems;
  orders: typeof orders;
  orgInvites: typeof orgInvites;
  orgMemberships: typeof orgMemberships;
  orgPacks: typeof orgPacks;
  organizations: typeof organizations;
  payouts: typeof payouts;
  plans: typeof plans;
  printTools: typeof printTools;
  scheduledPosts: typeof scheduledPosts;
  schedulerAccounts: typeof schedulerAccounts;
  seed: typeof seed;
  seedAll: typeof seedAll;
  seedCreatorTemplate: typeof seedCreatorTemplate;
  seedQuick: typeof seedQuick;
  seedTemplates: typeof seedTemplates;
  subscriptions: typeof subscriptions;
  teamInvites: typeof teamInvites;
  teamOrgPacks: typeof teamOrgPacks;
  teams: typeof teams;
  templateBrowser: typeof templateBrowser;
  templateData: typeof templateData;
  templates: typeof templates;
  templatesAdmin: typeof templatesAdmin;
  templatesSeed: typeof templatesSeed;
  test: typeof test;
  toolUsage: typeof toolUsage;
  tools: typeof tools;
  uploads: typeof uploads;
  usageMonthly: typeof usageMonthly;
  users: typeof users;
  videoTools: typeof videoTools;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
