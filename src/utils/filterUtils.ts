export interface GlobalFilterState {
  dateRange: string;
  stateFilter: string;
  serviceFilter: string;
}

export function filterByDate<T>(
  items: T[], 
  dateRange: string, 
  getDateFn?: (item: T) => Date | string | null | undefined
): T[] {
  if (!items || items.length === 0) return [];
  if (!dateRange || dateRange === 'All Time' || dateRange === 'all') return items;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

  return items.filter(item => {
    let rawDate: any = null;
    if (getDateFn) {
      rawDate = getDateFn(item);
    } else {
      const anyItem = item as any;
      rawDate = anyItem.date || anyItem.created_at || anyItem.scheduled_at || anyItem.created_date || anyItem.timestamp;
    }

    if (!rawDate) return true;

    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return true;

    if (dateRange === 'Today') {
      const itemDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return itemDateStr === todayStr || d >= startOfToday;
    } else if (dateRange === 'This Week') {
      return d >= sevenDaysAgo;
    } else if (dateRange === 'This Month') {
      return d >= thirtyDaysAgo;
    }

    return true;
  });
}

export function filterByState<T>(
  items: T[], 
  stateFilter: string, 
  getStateFn?: (item: T) => string | null | undefined
): T[] {
  if (!items || items.length === 0) return [];
  if (!stateFilter || stateFilter === 'All States' || stateFilter === 'all') return items;

  const targetState = stateFilter.trim().toLowerCase();

  return items.filter(item => {
    let stateVal: string = '';
    if (getStateFn) {
      stateVal = getStateFn(item) || '';
    } else {
      const anyItem = item as any;
      stateVal = anyItem.state || anyItem.state_name || anyItem.vet_state || anyItem.farmer_state || anyItem.location || anyItem.district || anyItem.city || '';
    }

    if (!stateVal) return true;
    return stateVal.toLowerCase().includes(targetState) || targetState.includes(stateVal.toLowerCase());
  });
}

export function filterByService<T>(
  items: T[], 
  serviceFilter: string, 
  getServiceFn?: (item: T) => string | null | undefined
): T[] {
  if (!items || items.length === 0) return [];
  if (!serviceFilter || serviceFilter === 'All Services' || serviceFilter === 'all') return items;

  const target = serviceFilter.trim().toLowerCase();

  return items.filter(item => {
    let typeVal: string = '';
    let catVal: string = '';
    if (getServiceFn) {
      typeVal = getServiceFn(item) || '';
    } else {
      const anyItem = item as any;
      typeVal = anyItem.type || anyItem.consultation_type || anyItem.service_type || anyItem.service || '';
      catVal = anyItem.category || anyItem.service_category || '';
    }

    const combined = `${typeVal} ${catVal}`.toLowerCase();

    if (target.includes('online') || target.includes('video') || target.includes('phone')) {
      return combined.includes('online') || combined.includes('video') || combined.includes('phone') || combined.includes('tele');
    }
    if (target.includes('visit') || target.includes('person') || target.includes('physical')) {
      return combined.includes('visit') || combined.includes('person') || combined.includes('physical') || combined.includes('clinic');
    }
    if (target.includes('ai') || target.includes('insemination')) {
      return combined.includes('ai') || combined.includes('insemination') || combined.includes('artificial');
    }
    if (target.includes('vaccin')) {
      return combined.includes('vaccin');
    }

    return combined.includes(target);
  });
}

export function applyGlobalFilters<T>(items: T[], filters: GlobalFilterState): T[] {
  let result = items;
  result = filterByDate(result, filters.dateRange);
  result = filterByState(result, filters.stateFilter);
  result = filterByService(result, filters.serviceFilter);
  return result;
}
