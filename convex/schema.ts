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
    mode: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    styles: v.optional(v.array(v.string())),
    formats: v.optional(v.array(v.string())),
    authorId: v.optional(v.string()),
    userId: v.string(),
    animation: v.optional(
      v.object({
        hasMotion: v.boolean(),
        motionTheme: v.optional(v.string()),
        timelineCount: v.number(),
        scrollAnimations: v.boolean(),
      }),
    ),
    pageTransitions: v.optional(v.any()),
    thumbnail: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    templateJsonUrl: v.optional(v.string()),
    isPublished: v.boolean(),
    version: v.number(),
    versions: v.optional(
      v.array(
        v.object({
          version: v.number(),
          templateJsonUrl: v.optional(v.string()),
          thumbnailUrl: v.optional(v.string()),
          createdAt: v.number(),
        }),
      ),
    ),
    publishedAt: v.optional(v.number()),
    license: v.optional(v.string()), // free | pro | marketplace
    price: v.optional(v.number()),
    creatorName: v.optional(v.string()),
    creatorAvatar: v.optional(v.string()),
    templateData: v.optional(v.any()),
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
        name: v.optional(v.string()),
        visible: v.optional(v.boolean()),
        locked: v.optional(v.boolean()),
        layout: v.optional(v.any()),
        children: v.optional(v.array(v.string())),
        animations: v.optional(v.array(v.any())),
        autoLayout: v.optional(v.any()),
        constraints: v.optional(v.any()),
        responsive: v.optional(v.any()),
        overrides: v.optional(v.any()),
        styleId: v.optional(v.string()),
        parentId: v.optional(v.string()),
        isArtboard: v.optional(v.boolean()),
        expanded: v.optional(v.boolean()),
        hidden: v.optional(v.boolean()),
        interactions: v.optional(v.array(v.any())),
      }),
    ),
    purchases: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    insertCount: v.optional(v.number()),
    viewCount: v.optional(v.number()),
    favoriteCount: v.optional(v.number()),
    searchClicks: v.optional(v.number()),
    score: v.optional(v.number()),
    assets: v.optional(
      v.array(
        v.object({
          id: v.string(),
          type: v.string(),
          url: v.string(),
          prompt: v.optional(v.string()),
          source: v.optional(v.string()),
          license: v.optional(v.string()),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
        }),
      ),
    ),
  })
    .index("by_user", ["userId"])
    .index("by_mode", ["mode"])
    .index("by_published", ["isPublished"])
    .index("by_category", ["category"]),
  templateCollections: defineTable({
    name: v.string(),
    thumbnailUrl: v.optional(v.string()),
    templateIds: v.array(v.string()),
    curated: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  templatePacks: defineTable({
    name: v.string(),
    thumbnailUrl: v.optional(v.string()),
    templateIds: v.array(v.string()),
    license: v.optional(v.string()),
    price: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  templateEvents: defineTable({
    templateId: v.string(),
    type: v.string(), // view | insert | favorite | search_select | preview | publish
    userId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_template", ["templateId"])
    .index("by_user", ["userId"]),
  assets: defineTable({
    userId: v.string(),
    projectId: v.optional(v.id("projects")),
    name: v.string(),
    fileId: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    url: v.string(),
    filename: v.optional(v.string()),
    type: v.optional(v.string()), // mime or friendly type
    size: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    waveform: v.optional(v.array(v.number())),
    thumbnail: v.optional(v.string()),
    thumbnails: v.optional(v.array(v.string())),
    colors: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    folder: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"]),
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
    source: v.optional(v.string()),
    license: v.optional(v.string()),
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
  brandkits: defineTable({
    userId: v.optional(v.string()),
    name: v.string(),
    tagline: v.optional(v.string()),
    personality: v.optional(v.array(v.string())),
    colorPalette: v.optional(
      v.object({
        primary: v.optional(v.array(v.string())),
        secondary: v.optional(v.array(v.string())),
        neutral: v.optional(v.array(v.string())),
        semantic: v.optional(
          v.object({
            success: v.optional(v.string()),
            warning: v.optional(v.string()),
            danger: v.optional(v.string()),
          }),
        ),
      }),
    ),
    typography: v.optional(
      v.object({
        headingFont: v.optional(v.string()),
        bodyFont: v.optional(v.string()),
        accentFont: v.optional(v.string()),
      }),
    ),
    logos: v.optional(v.array(v.string())),
    patterns: v.optional(v.array(v.string())),
    uiComponents: v.optional(v.array(v.string())),
    tokens: v.optional(v.any()),
    theme: v.optional(v.any()),
    icon: v.optional(v.string()),
    iconUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
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
    authorId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    previewImage: v.optional(v.string()),
    componentJSON: v.optional(v.string()),
    nodes: v.array(v.any()),
    props: v.optional(v.any()),
    variants: v.optional(v.any()),
    tokens: v.optional(v.any()),
    isPremium: v.optional(v.boolean()),
    price: v.optional(v.number()),
    downloads: v.optional(v.number()),
    favorites: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_project", ["projectId"]),
  componentInstances: defineTable({
    projectId: v.string(),
    componentId: v.string(),
    instanceId: v.string(),
    overrides: v.optional(v.any()),
    slotData: v.optional(v.any()),
    variant: v.optional(v.string()),
    useMasterMotion: v.optional(v.boolean()),
    frame: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
        parentId: v.optional(v.string()),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),
  editorStates: defineTable({
    projectId: v.string(),
    templateId: v.optional(v.string()),
    pages: v.optional(v.any()),
    layers: v.optional(v.any()),
    instanceRegistry: v.optional(v.any()),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_template", ["templateId"]),
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
  sceneGraphs: defineTable({
    contextId: v.string(),
    scene: v.any(), // unified scene graph (nodes, cameras, lights, materials, animations)
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_context", ["contextId"]),
  renderJobs: defineTable({
    type: v.string(), // 2d | motion | video | 3d | ar
    target: v.optional(v.string()),
    priority: v.optional(v.string()),
    status: v.string(), // queued | rendering | completed | failed
    sceneRef: v.optional(v.string()),
    payload: v.optional(v.any()),
    result: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"]),
  worlds: defineTable({
    name: v.string(),
    prompt: v.optional(v.string()),
    sceneGraphId: v.optional(v.id("sceneGraphs")),
    status: v.string(), // draft | building | ready | exported
    exports: v.optional(v.any()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"]),
  pageTransitions: defineTable({
    from: v.string(), // route or scene id
    to: v.string(),
    transitionIn: v.optional(v.any()), // timeline JSON
    transitionOut: v.optional(v.any()), // timeline JSON
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_from_to", ["from", "to"])
    .index("by_from", ["from"]),
  stateMachines: defineTable({
    componentId: v.string(),
    states: v.array(v.string()),
    transitions: v.array(
      v.object({
        from: v.string(),
        to: v.string(),
        trigger: v.string(),
        condition: v.optional(v.string()),
        timelineId: v.optional(v.id("animations")),
      }),
    ),
    variables: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_component", ["componentId"]),
  componentBehaviors: defineTable({
    componentId: v.string(),
    behaviors: v.array(
      v.object({
        type: v.string(), // hover | hoverMove | drag | scroll | swipe | tilt | tap | press etc.
        config: v.optional(v.any()),
        onTrigger: v.optional(v.string()),
        timelineId: v.optional(v.id("animations")),
      }),
    ),
    createdAt: v.number(),
  }).index("by_component", ["componentId"]),
  audioAssets: defineTable({
    projectId: v.optional(v.string()),
    name: v.string(),
    url: v.string(),
    duration: v.number(),
    waveform: v.array(v.number()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),
  animations: defineTable({
    projectId: v.optional(v.string()), // use string ids to avoid coupling to missing tables
    sceneId: v.string(),
    duration: v.number(),
    fps: v.number(),
    layers: v.array(
      v.object({
        id: v.string(),
        targetId: v.string(),
        property: v.string(),
        keyframes: v.array(
          v.object({
            id: v.string(),
            t: v.number(),
            value: v.any(),
            ease: v.optional(v.string()),
          }),
        ),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_scene", ["sceneId"])
    .index("by_project", ["projectId"]),

  categories: defineTable({
    id: v.string(),
    label: v.string(),
    parentId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_parent", ["parentId"]),

  tags: defineTable({
    id: v.string(),
    group: v.string(), // styles | moods | industries | formats
    label: v.string(),
  }).index("by_group", ["group"]),

  motionPacks: defineTable({
    name: v.string(),
    description: v.string(),
    version: v.string(),
    authorId: v.string(),
    contents: v.object({
      themes: v.array(v.any()),
      presets: v.array(v.any()),
      motionComponents: v.array(v.any()),
      pageTransitions: v.array(v.any()),
      timelines: v.array(v.any()),
      scrollProfiles: v.array(v.any()),
    }),
    category: v.string(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    downloads: v.number(),
    rating: v.optional(v.number()),
    previewUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
  }).index("by_category", ["category"]),
});
