import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const vTimestamp = v.number();
const vSlug = v.string();
const vJSON = v.any();
const vNullableString = v.optional(v.string());

export default defineSchema({
    // -----------------------------------------------------------------------
    // System / meta configuration
    // -----------------------------------------------------------------------
    appSettings: defineTable({
        key: v.string(),
        value: vJSON,
        updatedAt: vTimestamp,
    }).index('by_key', ['key']),

    test: defineTable({
        name: v.string(),
        value: v.number(),
    }),

    // -----------------------------------------------------------------------
    // Identity & access
    // -----------------------------------------------------------------------
    users: defineTable({
        email: v.optional(v.string()),
        name: vNullableString,
        image: vNullableString,
        provider: vNullableString,
        providerId: vNullableString,
        role: v.optional(v.string()),
        status: v.optional(v.string()),
        createdAt: vTimestamp,
        updatedAt: v.optional(vTimestamp),
        lastLoginAt: v.optional(vTimestamp),
        lastSeenAt: v.optional(vTimestamp),
        locale: vNullableString,
        stackUserId: vNullableString,
        displayName: vNullableString,
        primaryEmail: vNullableString,
        profileImageUrl: vNullableString,
    })
        .index('by_email', ['email'])
        .index('by_providerId', ['providerId'])
        .index('by_role', ['role'])
        .index('by_status', ['status'])
        .index('by_stack_user', ['stackUserId'])
        .index('by_last_seen', ['lastSeenAt']),

    organizations: defineTable({
        name: v.string(),
        slug: vSlug,
        ownerUserId: v.id('users'),
        planId: v.optional(v.id('plans')),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
        domains: v.optional(v.array(v.string())),
    })
        .index('by_slug', ['slug'])
        .index('by_owner', ['ownerUserId']),

    orgMemberships: defineTable({
        orgId: v.id('organizations'),
        userId: v.id('users'),
        role: v.string(),
        department: vNullableString,
        createdAt: vTimestamp,
    })
        .index('by_user', ['userId'])
        .index('by_org', ['orgId'])
        .index('by_org_user', ['orgId', 'userId']),

    orgInvites: defineTable({
        orgId: v.id('organizations'),
        email: v.string(),
        role: v.string(),
        token: v.string(),
        expiresAt: vTimestamp,
        createdAt: vTimestamp,
        acceptedAt: v.optional(vTimestamp),
        revokedAt: v.optional(vTimestamp),
    })
        .index('by_org', ['orgId'])
        .index('by_email', ['email'])
        .index('by_token', ['token']),

    teams: defineTable({
        name: v.string(),
        slug: vSlug,
        ownerUserId: v.id('users'),
        orgId: v.optional(v.id('organizations')),
        planId: v.optional(v.id('plans')),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
        brandColors: v.optional(v.array(v.string())),
        logoUrl: vNullableString,
        isOrg: v.optional(v.boolean()),
    })
        .index('by_slug', ['slug'])
        .index('by_owner', ['ownerUserId'])
        .index('by_org', ['orgId']),

    memberships: defineTable({
        teamId: v.id('teams'),
        userId: v.id('users'),
        role: v.string(),
        createdAt: vTimestamp,
        invitedByUserId: v.optional(v.id('users')),
    })
        .index('by_user', ['userId'])
        .index('by_team', ['teamId'])
        .index('by_team_user', ['teamId', 'userId'])
        .index('by_team_role', ['teamId', 'role']),

    teamInvites: defineTable({
        teamId: v.id('teams'),
        email: v.string(),
        role: v.string(),
        token: v.string(),
        expiresAt: vTimestamp,
        createdAt: vTimestamp,
        acceptedAt: v.optional(vTimestamp),
        revokedAt: v.optional(vTimestamp),
    })
        .index('by_team', ['teamId'])
        .index('by_email', ['email'])
        .index('by_token', ['token']),

    apiKeys: defineTable({
        teamId: v.id('teams'),
        name: v.string(),
        keyHash: v.string(),
        scopes: v.array(v.string()),
        lastUsedAt: v.optional(vTimestamp),
        createdAt: vTimestamp,
        disabled: v.optional(v.boolean()),
    })
        .index('by_team', ['teamId'])
        .index('by_keyHash', ['keyHash']),

    audits: defineTable({
        teamId: v.optional(v.id('teams')),
        actorUserId: v.optional(v.id('users')),
        action: v.string(),
        targetType: v.string(),
        targetId: vNullableString,
        metadata: vJSON,
        createdAt: vTimestamp,
    })
        .index('by_team_time', ['teamId', 'createdAt'])
        .index('by_actor_time', ['actorUserId', 'createdAt']),

    // -----------------------------------------------------------------------
    // Organization packs & classroom spaces
    // -----------------------------------------------------------------------
    orgPacks: defineTable({
        slug: vSlug,
        title: v.string(),
        description: vNullableString,
        features: v.array(v.string()),
        toolsEnabled: v.array(v.string()),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    }).index('by_slug', ['slug']),

    teamOrgPacks: defineTable({
        teamId: v.id('teams'),
        packId: v.id('orgPacks'),
        assignedAt: vTimestamp,
    })
        .index('by_team', ['teamId'])
        .index('by_pack', ['packId']),

    classrooms: defineTable({
        orgId: v.optional(v.id('organizations')),
        name: v.string(),
        code: v.string(),
        ownerUserId: v.id('users'),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_code', ['code'])
        .index('by_owner', ['ownerUserId'])
        .index('by_org', ['orgId']),

    classroomMemberships: defineTable({
        classroomId: v.id('classrooms'),
        userId: v.id('users'),
        role: v.string(),
        createdAt: vTimestamp,
    })
        .index('by_user', ['userId'])
        .index('by_classroom', ['classroomId'])
        .index('by_classroom_user', ['classroomId', 'userId']),

    // -----------------------------------------------------------------------
    // Creative tooling & catalogs
    // -----------------------------------------------------------------------
    elements: defineTable({
        key: v.string(),
        name: v.string(),
        category: v.string(),
        dataUrl: vNullableString,
        thumbnailUrl: vNullableString,
        tags: v.optional(v.array(v.string())),
        enabled: v.boolean(),
        order: v.number(),
    })
        .index('by_key', ['key'])
        .index('by_order', ['order'])
        .index('by_category', ['category'])
        .index('by_category_order', ['category', 'order']),

    tools: defineTable({
        slug: v.string(),
        title: v.string(),
        kind: v.string(),
        audience: v.optional(v.array(v.string())),
        category: vNullableString,
        status: vNullableString,
        pricingTier: vNullableString,
        limits: v.optional(
            v.object({
                daily: v.optional(v.number()),
                monthly: v.optional(v.number()),
                maxResolution: v.optional(v.number()),
            })
        ),
        metadata: vJSON,
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
        key: v.optional(v.string()),
        label: v.optional(v.string()),
        href: vNullableString,
        icon: vNullableString,
        order: v.optional(v.number()),
        enabled: v.optional(v.boolean()),
    })
        .index('by_slug', ['slug'])
        .index('by_kind', ['kind'])
        .index('by_status', ['status']),

    layoutCategories: defineTable({
        name: v.string(),
        slug: vSlug,
        order: v.number(),
    })
        .index('by_slug', ['slug'])
        .index('by_order', ['order']),

    layouts: defineTable({
        categoryId: v.id('layoutCategories'),
        name: v.string(),
        slug: vSlug,
        width: v.number(),
        height: v.number(),
        ratio: vNullableString,
        dpi: v.optional(v.number()),
        printSize: vNullableString,
        type: vNullableString,
        order: v.number(),
    })
        .index('by_category', ['categoryId'])
        .index('by_slug', ['slug'])
        .index('by_order', ['order']),

    templates: defineTable({
        layoutId: v.optional(v.id('layouts')),
        title: v.string(),
        slug: vSlug,
        category: v.string(),
        subcategory: vNullableString,
        data: vJSON,
        thumbnailUrl: vNullableString,
        tags: v.optional(v.array(v.string())),
        createdByUserId: v.optional(v.id('users')),
        createdByTeamId: v.optional(v.id('teams')),
        isPremium: v.optional(v.boolean()),
        isFeatured: v.optional(v.boolean()),
        status: v.optional(v.string()),
        usageCount: v.optional(v.number()),
        popularityScore: v.optional(v.number()),
        published: v.optional(v.boolean()),
        order: v.optional(v.number()),
        dataUrl: vNullableString,
        scene: v.optional(vJSON),
        priceCents: v.optional(v.number()),
        license: vNullableString,
        description: v.optional(v.string()),
        creatorId: v.optional(v.id('users')),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_slug', ['slug'])
        .index('by_category', ['category'])
        .index('by_featured', ['isFeatured'])
        .index('by_premium', ['isPremium'])
        .index('by_popularity', ['popularityScore'])
        .index('by_usage', ['usageCount'])
        .index('by_layout', ['layoutId'])
        .index('by_order', ['order'])
        .index('by_creator', ['creatorId'])
        .index('by_createdBy', ['createdByUserId'])
        .index('by_team_creator', ['createdByTeamId']),

    templateCategories: defineTable({
        key: v.string(),
        label: v.string(),
        description: vNullableString,
        sortOrder: v.number(),
        isVisible: v.optional(v.boolean()),
        icon: v.optional(v.string()),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_key', ['key'])
        .index('by_sort', ['sortOrder']),

    ecommerceTools: defineTable({
        name: v.string(),
        text: v.string(),
        icon: v.string(),
        path: v.string(),
        category: v.literal('ecommerce'),
        badge: v.optional(v.string()),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    }).index('by_category', ['category']),

    printTools: defineTable({
        name: v.string(),
        text: v.string(),
        icon: v.string(),
        path: v.string(),
        category: v.literal('print'),
        badge: v.optional(v.string()),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    }).index('by_category', ['category']),

    videoTools: defineTable({
        name: v.string(),
        text: v.string(),
        icon: v.string(),
        path: v.string(),
        category: v.literal('video'),
        badge: v.optional(v.string()),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    }).index('by_category', ['category']),

    brandKits: defineTable({
        userId: v.optional(v.id('users')),
        teamId: v.optional(v.id('teams')),
        name: v.string(),
        colors: v.optional(v.array(v.string())),
        palette: v.optional(v.array(v.string())),
        fonts: v.optional(
            v.array(
                v.object({
                    name: v.string(),
                    url: vNullableString,
                })
            )
        ),
        logoUrls: v.optional(v.array(v.string())),
        logos: v.optional(
            v.array(
                v.object({
                    name: v.string(),
                    url: v.string(),
                })
            )
        ),
        guidelines: vNullableString,
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_user', ['userId'])
        .index('by_team', ['teamId'])
        .index('by_team_name', ['teamId', 'name']),

    logoProjects: defineTable({
        userId: v.id('users'),
        teamId: v.optional(v.id('teams')),
        title: v.string(),
        slug: vSlug,
        width: v.number(),
        height: v.number(),
        scene: v.optional(vJSON),
        brandKitId: v.optional(v.id('brandKits')),
        published: v.boolean(),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_user', ['userId'])
        .index('by_team', ['teamId'])
        .index('by_slug', ['slug']),

    logoExports: defineTable({
        projectId: v.id('logoProjects'),
        format: v.string(),
        url: v.string(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        transparent: v.optional(v.boolean()),
        createdAt: vTimestamp,
    }).index('by_project', ['projectId']),

    assets: defineTable({
        teamId: v.id('teams'),
        uploaderUserId: v.id('users'),
        kind: v.string(),
        url: v.string(),
        size: v.optional(v.number()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        mime: vNullableString,
        tags: v.optional(v.array(v.string())),
        metadata: vJSON,
        createdAt: vTimestamp,
    })
        .index('by_team_time', ['teamId', 'createdAt'])
        .index('by_uploader', ['uploaderUserId']),

    uploads: defineTable({
        userId: v.id('users'),
        teamId: v.optional(v.id('teams')),
        url: v.string(),
        kind: v.string(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        tags: v.optional(v.array(v.string())),
        size: v.optional(v.number()),
        mime: vNullableString,
        metadata: v.optional(vJSON),
        createdAt: vTimestamp,
    })
        .index('by_user', ['userId'])
        .index('by_team', ['teamId'])
        .index('by_created', ['createdAt']),

    designs: defineTable({
        userId: v.id('users'),
        teamId: v.optional(v.id('teams')),
        title: v.string(),
        layoutId: v.optional(v.id('layouts')),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        pages: v.array(vJSON),
        previewUrl: vNullableString,
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
        ownerUserId: v.optional(v.id('users')),
        type: v.optional(v.string()),
        status: v.optional(v.string()),
        data: v.optional(vJSON),
        thumbnailUrl: vNullableString,
        tags: v.optional(v.array(v.string())),
        isPublic: v.optional(v.boolean()),
    })
        .index('by_user', ['userId'])
        .index('by_team', ['teamId'])
        .index('by_updated', ['updatedAt'])
        .index('by_team_time', ['teamId', 'createdAt'])
        .index('by_owner_time', ['ownerUserId', 'createdAt'])
        .index('by_team_status', ['teamId', 'status']),

    designRevisions: defineTable({
        designId: v.id('designs'),
        authorUserId: v.id('users'),
        data: vJSON,
        message: vNullableString,
        createdAt: vTimestamp,
    }).index('by_design_time', ['designId', 'createdAt']),

    designComments: defineTable({
        designId: v.id('designs'),
        authorUserId: v.id('users'),
        body: v.string(),
        resolved: v.optional(v.boolean()),
        createdAt: vTimestamp,
    })
        .index('by_design_time', ['designId', 'createdAt'])
        .index('by_author', ['authorUserId']),

    // -----------------------------------------------------------------------
    // Collaboration, approvals & activity
    // -----------------------------------------------------------------------
    approvals: defineTable({
        teamId: v.optional(v.id('teams')),
        classroomId: v.optional(v.id('classrooms')),
        designId: v.id('designs'),
        requesterId: v.id('users'),
        status: v.string(),
        dueAt: v.optional(vTimestamp),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_team', ['teamId'])
        .index('by_design', ['designId'])
        .index('by_status', ['status']),

    approvalComments: defineTable({
        approvalId: v.id('approvals'),
        userId: v.id('users'),
        message: v.string(),
        createdAt: vTimestamp,
    }).index('by_approval', ['approvalId']),

    activityEvents: defineTable({
        orgId: v.optional(v.id('organizations')),
        teamId: v.optional(v.id('teams')),
        classroomId: v.optional(v.id('classrooms')),
        actorId: v.id('users'),
        type: v.string(),
        meta: v.optional(vJSON),
        createdAt: vTimestamp,
    })
        .index('by_team', ['teamId'])
        .index('by_org', ['orgId'])
        .index('by_classroom', ['classroomId'])
        .index('by_actor', ['actorId'])
        .index('by_created', ['createdAt']),

    migrations: defineTable({
        key: v.string(),
        createdAt: vTimestamp,
    }).index('by_key', ['key']),

    notifications: defineTable({
        userId: v.id('users'),
        teamId: v.optional(v.id('teams')),
        type: v.string(),
        data: vJSON,
        readAt: v.optional(vTimestamp),
        createdAt: vTimestamp,
    })
        .index('by_user_time', ['userId', 'createdAt'])
        .index('by_team_time', ['teamId', 'createdAt']),

    // -----------------------------------------------------------------------
    // Real-time presence & cursors
    // -----------------------------------------------------------------------
    presence: defineTable({
        userId: v.id('users'),
        userName: v.string(),
        userAvatar: v.optional(v.string()),
        designId: v.string(),
        cursor: v.optional(
            v.object({
                x: v.number(),
                y: v.number(),
            })
        ),
        active: v.boolean(),
        updatedAt: vTimestamp,
    }).index('by_design', ['designId']),

    // -----------------------------------------------------------------------
    // Chat Messages & Threads
    // -----------------------------------------------------------------------
    messages: defineTable({
        threadId: v.string(),
        userId: v.id('users'),
        userName: v.string(),
        userAvatar: v.optional(v.string()),
        text: v.string(),
        createdAt: vTimestamp,
    }).index('by_thread_time', ['threadId', 'createdAt']),

    // -----------------------------------------------------------------------
    // Shared Canvas Live Nodes
    // -----------------------------------------------------------------------
    canvasNodes: defineTable({
        designId: v.string(),
        nodeId: v.string(),
        type: v.string(),
        props: v.any(),
        updatedBy: v.optional(v.id('users')),
        updatedAt: vTimestamp,
    }).index('by_design', ['designId']),

    // -----------------------------------------------------------------------
    // Analytics & usage
    // -----------------------------------------------------------------------
    usageMonthly: defineTable({
        orgId: v.optional(v.id('organizations')),
        teamId: v.optional(v.id('teams')),
        month: v.string(),
        exports: v.number(),
        designsCreated: v.number(),
        storageBytes: v.number(),
        activeUsers: v.number(),
        updatedAt: vTimestamp,
    })
        .index('by_org_month', ['orgId', 'month'])
        .index('by_team_month', ['teamId', 'month']),

    designInsights: defineTable({
        designId: v.id('designs'),
        period: v.string(),
        views: v.number(),
        exports: v.number(),
        shares: v.number(),
        createdAt: vTimestamp,
    }).index('by_design_period', ['designId', 'period']),

    // -----------------------------------------------------------------------
    // AI jobs and credit usage
    // -----------------------------------------------------------------------
    aiJobs: defineTable({
        teamId: v.id('teams'),
        userId: v.id('users'),
        toolSlug: v.string(),
        input: vJSON,
        status: v.string(),
        result: v.optional(vJSON),
        error: vNullableString,
        createdAt: vTimestamp,
        startedAt: v.optional(vTimestamp),
        finishedAt: v.optional(vTimestamp),
    })
        .index('by_team_time', ['teamId', 'createdAt'])
        .index('by_user_time', ['userId', 'createdAt'])
        .index('by_tool_time', ['toolSlug', 'createdAt']),

    toolUsage: defineTable({
        teamId: v.id('teams'),
        userId: v.id('users'),
        toolSlug: v.string(),
        period: v.string(),
        count: v.number(),
        lastUsedAt: vTimestamp,
    })
        .index('by_team_period', ['teamId', 'period'])
        .index('by_user_period', ['userId', 'period'])
        .index('by_tool_period', ['toolSlug', 'period']),

    aiCredits: defineTable({
        userId: v.id('users'),
        balance: v.number(),
        updatedAt: vTimestamp,
    }).index('by_user', ['userId']),

    creditTransactions: defineTable({
        userId: v.id('users'),
        delta: v.number(),
        reason: v.string(),
        meta: v.optional(vJSON),
        createdAt: vTimestamp,
    }).index('by_user', ['userId']),

    // -----------------------------------------------------------------------
    // Publishing & scheduling
    // -----------------------------------------------------------------------
    schedulerAccounts: defineTable({
        teamId: v.id('teams'),
        provider: v.string(),
        accountRef: v.string(),
        token: vNullableString,
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_team', ['teamId'])
        .index('by_provider', ['provider']),

    scheduledPosts: defineTable({
        teamId: v.id('teams'),
        authorUserId: v.id('users'),
        designId: v.optional(v.id('designs')),
        caption: vNullableString,
        platforms: v.array(v.string()),
        scheduledFor: vTimestamp,
        status: v.string(),
        result: v.optional(vJSON),
        createdAt: vTimestamp,
    })
        .index('by_team_time', ['teamId', 'scheduledFor'])
        .index('by_author_time', ['authorUserId', 'scheduledFor']),

    // -----------------------------------------------------------------------
    // Marketplace & monetisation
    // -----------------------------------------------------------------------
    marketplaceProducts: defineTable({
        kind: v.string(),
        refId: v.string(),
        title: v.string(),
        description: vNullableString,
        priceCents: v.number(),
        currency: v.string(),
        sellerUserId: v.optional(v.id('users')),
        sellerTeamId: v.optional(v.id('teams')),
        status: v.string(),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_kind', ['kind'])
        .index('by_seller_user', ['sellerUserId'])
        .index('by_seller_team', ['sellerTeamId']),

    marketplacePurchases: defineTable({
        productId: v.id('marketplaceProducts'),
        buyerUserId: v.id('users'),
        buyerTeamId: v.optional(v.id('teams')),
        amountCents: v.number(),
        currency: v.string(),
        provider: v.string(),
        providerPaymentId: v.string(),
        createdAt: vTimestamp,
    })
        .index('by_product', ['productId'])
        .index('by_buyer_user', ['buyerUserId'])
        .index('by_buyer_team', ['buyerTeamId']),

    payouts: defineTable({
        sellerUserId: v.optional(v.id('users')),
        sellerTeamId: v.optional(v.id('teams')),
        amountCents: v.number(),
        currency: v.string(),
        provider: v.string(),
        providerTransferId: v.string(),
        status: v.string(),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_seller_user', ['sellerUserId'])
        .index('by_seller_team', ['sellerTeamId']),

    creatorProfiles: defineTable({
        userId: v.id('users'),
        displayName: v.string(),
        bio: vNullableString,
        avatarUrl: vNullableString,
        socials: v.optional(vJSON),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    }).index('by_user', ['userId']),

    orders: defineTable({
        buyerId: v.id('users'),
        totalCents: v.number(),
        currency: v.string(),
        status: v.string(),
        provider: vNullableString,
        providerOrderId: vNullableString,
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_buyer', ['buyerId'])
        .index('by_provider', ['provider', 'providerOrderId']),

    orderItems: defineTable({
        orderId: v.id('orders'),
        templateId: v.optional(v.id('templates')),
        priceCents: v.number(),
        license: v.string(),
        createdAt: vTimestamp,
    }).index('by_order', ['orderId']),

    licenses: defineTable({
        buyerId: v.id('users'),
        templateId: v.id('templates'),
        license: v.string(),
        issuedAt: vTimestamp,
        orderId: v.optional(v.id('orders')),
    })
        .index('by_buyer', ['buyerId'])
        .index('by_template', ['templateId']),

    // -----------------------------------------------------------------------
    // Plans, billing & subscriptions
    // -----------------------------------------------------------------------
    plans: defineTable({
        key: v.string(),
        slug: vSlug,
        title: v.string(),
        priceCentsMonthly: v.number(),
        priceCentsYearly: v.number(),
        currency: vNullableString,
        limits: vJSON,
        features: v.array(v.string()),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_key', ['key'])
        .index('by_slug', ['slug']),

    subscriptions: defineTable({
        userId: v.optional(v.id('users')),
        orgId: v.optional(v.id('organizations')),
        teamId: v.optional(v.id('teams')),
        planId: v.id('plans'),
        status: v.string(),
        renewsAt: v.optional(vTimestamp),
        canceledAt: v.optional(vTimestamp),
        provider: vNullableString,
        providerSubId: vNullableString,
        providerCustomerId: vNullableString,
        currentPeriodStart: v.optional(vTimestamp),
        currentPeriodEnd: v.optional(vTimestamp),
        trialEndsAt: v.optional(vTimestamp),
        seats: v.optional(v.number()),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
    })
        .index('by_user', ['userId'])
        .index('by_org', ['orgId'])
        .index('by_team', ['teamId'])
        .index('by_provider', ['provider', 'providerSubId'])
        .index('by_provider_customer', ['providerCustomerId']),

    invoices: defineTable({
        subscriptionId: v.id('subscriptions'),
        amountCents: v.number(),
        currency: v.string(),
        status: v.string(),
        providerInvoiceId: v.string(),
        url: vNullableString,
        createdAt: vTimestamp,
    }).index('by_subscription', ['subscriptionId']),

    // -----------------------------------------------------------------------
    // Integrations & connections
    // -----------------------------------------------------------------------
    integrations: defineTable({
        teamId: v.id('teams'),
        type: v.string(),
        settings: vJSON,
        tokens: v.optional(vJSON),
        createdAt: vTimestamp,
        updatedAt: vTimestamp,
        enabled: v.optional(v.boolean()),
    }).index('by_team_type', ['teamId', 'type']),
});
