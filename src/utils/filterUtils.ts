export interface GlobalFilterState {
  dateRange: string;
  stateFilter: string;
  serviceFilter: string;
  customStartDate?: string;
  customEndDate?: string;
}

export function filterByDate<T>(
  items: T[], 
  dateRange: string, 
  customStartDate?: string,
  customEndDate?: string,
  getDateFn?: (item: T) => Date | string | null | undefined
): T[] {
  if (!items || items.length === 0) return [];
  if (!dateRange || dateRange === 'All Time' || dateRange === 'all') return items;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

  let customStart: Date | null = null;
  let customEnd: Date | null = null;

  if (dateRange === 'Custom') {
    if (customStartDate) {
      customStart = new Date(customStartDate);
      customStart.setHours(0, 0, 0, 0);
    }
    if (customEndDate) {
      customEnd = new Date(customEndDate);
      customEnd.setHours(23, 59, 59, 999);
    }
  }

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

    if (dateRange === 'Custom') {
      if (customStart && d < customStart) return false;
      if (customEnd && d > customEnd) return false;
      return true;
    } else if (dateRange === 'Today') {
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
      stateVal = String(anyItem.state || anyItem.state_name || anyItem.vet_state || anyItem.farmer_state || anyItem.location || anyItem.district || anyItem.city || '');
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
    let typeVal = '';
    let catVal = '';
    let titleVal = '';
    let descVal = '';

    if (getServiceFn) {
      typeVal = getServiceFn(item) || '';
    } else {
      const anyItem = item as any;
      typeVal = String(anyItem.type || anyItem.consultation_type || anyItem.service_type || anyItem.service || '');
      catVal = String(anyItem.category || anyItem.service_category || anyItem.category_name || anyItem.service_name || '');
      titleVal = String(anyItem.title || anyItem.reason || anyItem.symptoms || '');
      descVal = String(anyItem.description || anyItem.notes || '');
    }

    const combined = `${typeVal} ${catVal} ${titleVal} ${descVal}`.toLowerCase();

    // Matching for Online Consultation
    if (target.includes('online') || target.includes('video') || target.includes('phone')) {
      return (
        combined.includes('online') ||
        combined.includes('video') ||
        combined.includes('phone') ||
        combined.includes('tele') ||
        combined.includes('instant') ||
        combined.includes('chat') ||
        typeVal.toUpperCase() === 'ONLINE'
      );
    }

    // Matching for In-Person Visit
    if (target.includes('visit') || target.includes('person') || target.includes('physical')) {
      return (
        combined.includes('visit') ||
        combined.includes('person') ||
        combined.includes('physical') ||
        combined.includes('clinic') ||
        combined.includes('home') ||
        combined.includes('doorstep') ||
        typeVal.toUpperCase() === 'PHYSICAL' ||
        typeVal.toUpperCase() === 'PHYSICAL_VISIT'
      );
    }

    // Matching for AI / Insemination
    if (target.includes('ai') || target.includes('insemination') || target.includes('artificial')) {
      return (
        /\bai\b/i.test(combined) ||
        combined.includes('insemination') ||
        combined.includes('artificial') ||
        combined.includes('semen') ||
        combined.includes('breeding') ||
        typeVal.toUpperCase() === 'AI' ||
        catVal.toUpperCase() === 'AI' ||
        catVal.toUpperCase() === 'ARTIFICIAL_INSEMINATION'
      );
    }

    // Matching for Vaccination
    if (target.includes('vaccin') || target.includes('vacc') || target.includes('tika')) {
      return (
        combined.includes('vaccin') ||
        combined.includes('vacc') ||
        combined.includes('tika') ||
        combined.includes('booster') ||
        combined.includes('immun') ||
        catVal.toUpperCase() === 'VACCINATION' ||
        typeVal.toUpperCase() === 'VACCINATION'
      );
    }

    return combined.includes(target);
  });
}

export function applyGlobalFilters<T>(items: T[], filters: GlobalFilterState): T[] {
  let result = items;
  result = filterByDate(result, filters.dateRange, filters.customStartDate, filters.customEndDate);
  result = filterByState(result, filters.stateFilter);
  result = filterByService(result, filters.serviceFilter);
  return result;
}
