'use client';

import { useSyncExternalStore } from 'react';
import { subscribeHistory, getHistoryStatus } from './historyService';

const serverStatus = getHistoryStatus();

function getClientSnapshot() {
    return getHistoryStatus();
}

export function useHistoryStatus() {
    return useSyncExternalStore(subscribeHistory, getClientSnapshot, () => serverStatus);
}
