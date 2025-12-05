import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    stackUserId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_stack_user", ["stackUserId"])
    .index("by_email", ["email"]),
  templates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    mode: v.string(),
    userId: v.string(),
    thumbnail: v.optional(v.string()),
    tags: v.array(v.string()),
    category: v.optional(v.string()),
    width: v.number(),
    height: v.number(),
    layers: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
        rotation: v.optional(v.number()),
        url: v.optional(v.string()),
        content: v.optional(v.string()),
        props: v.optional(v.any()),
      }),
    ),
    isPublished: v.boolean(),
    price: v.optional(v.number()),
    purchases: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    version: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_mode", ["mode"])
    .index("by_published", ["isPublished"])
    .index("by_category", ["category"]),
  assets: defineTable({
    userId: v.string(),
    name: v.string(),
    fileId: v.string(),
    url: v.string(),
    filename: v.optional(v.string()),
    type: v.optional(v.string()),
    size: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    tags: v.array(v.string()),
    folder: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  presence: defineTable({
    userId: v.string(),
    projectId: v.string(),
    cursor: v.object({
      x: v.number(),
      y: v.number(),
    }),
    selection: v.array(v.string()),
    lastActive: v.number(),
  }).index("by_project", ["projectId"]),
  assetLibrary: defineTable({
    userId: v.string(),
    type: v.string(), // image | icon | svg | 3d | illustration | texture | lottie
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    fileUrl: v.string(),
    previewUrl: v.string(),
    fileType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    packId: v.optional(v.string()),
    isPremium: v.boolean(),
    price: v.optional(v.number()),
    downloads: v.number(),
    favorites: v.number(),
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_user", ["userId"]),
  assetPacks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    coverImage: v.string(),
    price: v.optional(v.number()),
    isPremium: v.boolean(),
    assets: v.array(v.string()),
    downloads: v.number(),
    favorites: v.number(),
    createdAt: v.number(),
  }).index("by_category", ["category"]),
  comments: defineTable({
    userId: v.string(),
    projectId: v.string(),
    layerId: v.optional(v.string()),
    x: v.number(),
    y: v.number(),
    message: v.string(),
    replies: v.array(
      v.object({
        userId: v.string(),
        message: v.string(),
        createdAt: v.number(),
      }),
    ),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),
  components: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    previewImage: v.optional(v.string()),
    componentJSON: v.optional(v.string()),
    nodes: v.array(v.any()),
    variants: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        nodes: v.array(v.any()),
      }),
    ),
    isPremium: v.optional(v.boolean()),
    price: v.optional(v.number()),
    downloads: v.optional(v.number()),
    favorites: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"]),
  styles: defineTable({
    userId: v.string(),
    type: v.string(), // "color" | "text" | "effect"
    name: v.string(),
    value: v.any(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  themes: defineTable({
    userId: v.string(),
    name: v.string(),
    tokens: v.object({
      colors: v.object({
        primary: v.string(),
        secondary: v.string(),
        surface: v.string(),
        text: v.string(),
        background: v.string(),
        success: v.string(),
        danger: v.string(),
        warning: v.string(),
      }),
    }),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  userBehavior: defineTable({
    userId: v.string(),
    action: v.string(), // viewed_template, used_template, viewed_asset, used_component, etc.
    targetId: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  embeddings: defineTable({
    itemId: v.string(), // templateId | componentId | assetId
    itemType: v.string(),
    vector: v.array(v.number()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_item", ["itemId"]),
  userEmbeddings: defineTable({
    userId: v.string(),
    vector: v.array(v.number()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  agents: defineTable({
    name: v.string(),
    status: v.string(), // idle | running | failed | done
    lastRun: v.optional(v.number()),
  }).index("by_name", ["name"]),
  agent_tasks: defineTable({
    agent: v.string(), // "Brand Agent", etc.
    prompt: v.optional(v.string()),
    state: v.optional(v.any()),
    status: v.string(), // queued | running | completed | failed
    result: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_agent", ["agent"]),
  messages: defineTable({
    agent: v.string(),
    content: v.string(),
    references: v.optional(v.any()),
    room: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_agent", ["agent"]),
  workspace: defineTable({
    data: v.any(),
    updatedAt: v.number(),
  }).index("by_updated", ["updatedAt"]),
  snapshots: defineTable({
    data: v.any(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
  events: defineTable({
    type: v.string(),
    actor: v.string(),
    layerId: v.optional(v.string()),
    payload: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_time", ["timestamp"]),
  simulation_results: defineTable({
    type: v.string(), // scenario | ux_test
    data: v.any(),
    createdAt: v.number(),
  }).index("by_type", ["type"]),
  agent_memory: defineTable({
    agentName: v.string(),
    runs: v.number(),
    successes: v.number(),
    failures: v.number(),
    corrections: v.optional(v.any()),
    behaviorDeltas: v.optional(v.any()),
    skillWeights: v.optional(v.any()),
    lastUpdated: v.number(),
  }).index("by_agent", ["agentName"]),
  style_memory: defineTable({
    userId: v.string(),
    tokens: v.optional(v.any()),
    patterns: v.optional(v.any()),
    componentStyles: v.optional(v.any()),
    animationPrefs: v.optional(v.any()),
    interactionPrefs: v.optional(v.any()),
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),
  style_events: defineTable({
    userId: v.string(),
    eventType: v.string(),
    data: v.any(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),
  brand_memory: defineTable({
    projectId: v.string(),
    tokens: v.optional(v.any()),
    components: v.optional(v.any()),
    typography: v.optional(v.any()),
    layoutDNA: v.optional(v.any()),
    animationDNA: v.optional(v.any()),
    lastUpdated: v.optional(v.number()),
  }).index("by_project", ["projectId"]),
  sprints: defineTable({
    number: v.number(),
    goals: v.any(),
    tasks: v.any(),
    status: v.string(), // planning | active | complete
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_status", ["status"]),
  backlog: defineTable({
    title: v.string(),
    description: v.string(),
    priority: v.number(),
    assignedTo: v.optional(v.string()),
    status: v.string(), // todo | doing | done
    createdAt: v.number(),
  }).index("by_priority", ["priority"]),
  modules: defineTable({
    name: v.string(),
    version: v.string(),
    json: v.any(),
    authorId: v.string(),
    type: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    downloads: v.number(),
    rating: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_type", ["type"]),
  knowledge_nodes: defineTable({
    nodeId: v.string(),
    category: v.string(),
    content: v.string(),
    embedding: v.optional(v.array(v.number())),
    confidence: v.number(),
    sourceAgent: v.string(),
    relations: v.optional(v.any()),
    projectsUsedIn: v.optional(v.any()),
    lastUpdated: v.number(),
  })
    .index("by_node", ["nodeId"])
    .index("by_category", ["category"])
    .index("by_source", ["sourceAgent"]),
  knowledge_relations: defineTable({
    from: v.string(),
    to: v.string(),
    relation: v.string(), // improves | prevents | implies | contradicts | belongs_to etc.
    weight: v.number(),
    lastUpdated: v.number(),
  }).index("by_from", ["from"]),
  apiUsage: defineTable({
    key: v.string(),
    agent: v.string(),
    count: v.number(),
    timestamp: v.number(),
  }).index("by_key", ["key"]),
  orgs: defineTable({
    name: v.string(),
    ownerId: v.string(),
    members: v.any(), // { userId: role }
    teams: v.any(), // team ids or summaries
    settings: v.any(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),
  teams: defineTable({
    orgId: v.string(),
    name: v.string(),
    members: v.any(), // { userId: role }
    aiAgents: v.any(), // [{ name, role }]
    permissions: v.any(),
    createdAt: v.number(),
  }).index("by_org", ["orgId"]),
  auditLogs: defineTable({
    orgId: v.string(),
    actor: v.string(), // human or AI
    action: v.string(),
    data: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_org", ["orgId"]),
  aiPolicies: defineTable({
    orgId: v.string(),
    rules: v.any(), // governance rules
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_org", ["orgId"]),
  ecosystemGraphs: defineTable({
    orgId: v.string(),
    nodes: v.any(), // [{ id, type, meta }]
    edges: v.any(), // [{ from, to, relation }]
    relationships: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_org", ["orgId"]),
  deployments: defineTable({
    projectId: v.string(),
    target: v.string(), // vercel | cloudflare | aws | gcp | azure | fly | do | edge
    region: v.optional(v.string()),
    status: v.string(), // queued | deploying | healthy | failed | rolled_back
    url: v.optional(v.string()),
    error: v.optional(v.string()),
    meta: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),
  processes: defineTable({
    pid: v.number(),
    agent: v.string(),
    state: v.string(), // running | sleeping | waiting | terminated
    priority: v.string(),
    cpu: v.number(),
    memory: v.number(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_agent", ["agent"])
    .index("by_pid", ["pid"]),
  systemEvents: defineTable({
    type: v.string(),
    payload: v.optional(v.any()),
    actor: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_type", ["type"]),
  sensoryInputs: defineTable({
    kind: v.string(), // vision | audio | video | 3d | ar
    source: v.optional(v.string()),
    refId: v.optional(v.string()),
    url: v.optional(v.string()),
    metadata: v.optional(v.any()),
    embedding: v.optional(v.array(v.number())),
    createdAt: v.number(),
  }).index("by_kind", ["kind"]),
  spatialGraphs: defineTable({
    contextId: v.string(),
    nodes: v.any(),
    edges: v.any(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_context", ["contextId"]),
});
