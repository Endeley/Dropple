// /workspace/definitions/WorkspaceDefinition.js

/**
 * @typedef {'graphic'|'uiux'|'video'|'podcast'|'animation'|'material'|'branding'|'documents'|'education'|'icon'|'ai'|'dev'} WorkspaceId
 */

/**
 * @typedef {'nodeTree'|'layout'|'constraints'|'autoLayout'|'timeline'|'audio'|'physics'|'vector'|'tokens'|'stateMachine'|'ai'} EngineId
 */

/**
 * @typedef {'select'|'move'|'resize'|'text'|'shape'|'image'|'pen'|'vector'|'audio'|'timeline'|'inspect'} ToolId
 */

/**
 * @typedef {'frame'|'group'|'shape'|'text'|'image'|'video'|'audio'|'vector'|'component'} NodeType
 */

/**
 * @typedef {'layers'|'properties'|'assets'|'timeline'|'tokens'|'ai'|'export'} PanelId
 */

/**
 * @typedef {Object} WorkspaceDefinition
 * @property {WorkspaceId} id
 * @property {string} label
 * @property {string} description
 * @property {EngineId[]} engines
 * @property {ToolId[]} tools
 * @property {NodeType[]} nodeTypes
 * @property {PanelId[]} panels
 * @property {ToolId} defaultTool
 * @property {{ enabled: boolean, mode: 'none'|'ui'|'audio'|'full' }} [timeline]
 * @property {{ formats: string[] }} [export]
 * @property {WorkspaceId} [extends]
 */

export {};
