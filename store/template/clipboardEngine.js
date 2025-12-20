import { deepClone as cloneDeep } from '@/lib/deepClone';

/* ======================================================
   CLIPBOARD ENGINE
   (copy / paste / duplicate logic only)
====================================================== */

export const createClipboardEngine = (set, get) => ({
    /* ------------------------------------
     INTERNAL HELPERS
  ------------------------------------ */

    collectClipboardLayers: (ids = []) => {
        const { layers } = get().getActiveContext();
        const map = new Map(layers.map((l) => [l.id, l]));
        const visited = new Set();
        const collected = [];

        const walk = (id) => {
            if (!id || visited.has(id)) return;
            const layer = map.get(id);
            if (!layer) return;

            visited.add(id);
            collected.push(cloneDeep(layer));
            (layer.children || []).forEach(walk);
        };

        const roots = [];
        ids.forEach((id) => {
            if (!map.has(id)) return;
            roots.push(id);
            walk(id);
        });

        return { layers: collected, rootIds: roots };
    },

    remapClipboardLayers: (clipboard, targetParentId, offset = 20) => {
        const idMap = new Map();

        clipboard.layers.forEach((l) => {
            idMap.set(l.id, 'layer_' + crypto.randomUUID());
        });

        const rootNewIds = [];

        const remapped = clipboard.layers.map((layer) => {
            const copy = cloneDeep(layer);
            const oldId = copy.id;

            copy.id = idMap.get(oldId);

            if (clipboard.rootIds.includes(oldId)) {
                rootNewIds.push(copy.id);
            }

            if (copy.parentId && idMap.has(copy.parentId)) {
                copy.parentId = idMap.get(copy.parentId);
            } else if (clipboard.rootIds.includes(oldId)) {
                copy.parentId = targetParentId || null;
            }

            if (copy.children?.length) {
                copy.children = copy.children.map((cid) => idMap.get(cid)).filter(Boolean);
            }

            if (clipboard.rootIds.includes(oldId)) {
                copy.x = (copy.x || 0) + offset;
                copy.y = (copy.y || 0) + offset;
            }

            return copy;
        });

        return { remapped, rootNewIds };
    },

    applyRemappedClones: (remapped, rootNewIds, select = true) => {
        const state = get();
        const page = state.getActivePage();
        const base = page.layers || [];

        const map = new Map(base.map((l) => [l.id, { ...l }]));

        remapped.forEach((l) => map.set(l.id, l));

        remapped.forEach((l) => {
            if (!l.parentId) return;
            const parent = map.get(l.parentId);
            if (!parent) return;
            parent.children = Array.from(new Set([...(parent.children || []), l.id]));
        });

        const layers = Array.from(map.values());

        set({
            selectedLayerId: select ? rootNewIds[0] : state.selectedLayerId,
            selectedLayers: select ? rootNewIds : state.selectedLayers,
        });

        state.setActivePageLayers(layers);
        state.triggerAutoSave();
    },

    /* ------------------------------------
     PUBLIC ACTIONS
  ------------------------------------ */

    copyLayers: (ids) => {
        if (!ids?.length) return;
        const clip = get().collectClipboardLayers(ids);
        if (!clip.layers.length) return;

        set({
            clipboardLayers: clip.layers,
            clipboardRootIds: clip.rootIds,
            pasteCount: 0,
        });
    },

    pasteLayers: () => {
        const state = get();
        if (!state.clipboardLayers?.length) return;

        const selected = state.selectedLayers;
        const target = selected?.length === 1 ? state.findLayer(selected[0]) : null;

        const parentId = target?.type === 'frame' ? target.id : target?.parentId || null;

        const { remapped, rootNewIds } = state.remapClipboardLayers(
            {
                layers: state.clipboardLayers,
                rootIds: state.clipboardRootIds,
            },
            parentId,
            20 + state.pasteCount * 10
        );

        state.applyRemappedClones(remapped, rootNewIds, true);

        set({ pasteCount: state.pasteCount + 1 });
    },

    duplicateLayer: (id) => {
        const clip = get().collectClipboardLayers([id]);
        if (!clip.layers.length) return [];

        const { remapped, rootNewIds } = get().remapClipboardLayers(clip, null, 15);

        get().applyRemappedClones(remapped, rootNewIds, true);
        return rootNewIds;
    },
});
