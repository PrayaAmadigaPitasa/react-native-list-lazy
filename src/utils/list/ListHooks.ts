/* eslint-disable react-hooks/exhaustive-deps */
import {MutableRefObject, useCallback, useEffect, useMemo, useRef} from 'react';
import {ListIndicatorStatus, ObjectState} from '@types';
import {useDefaultState} from '../object';

export interface ListLazyActionLoad {
  merge?: boolean;
}

export interface ListLazyAction<ItemT> {
  initialize: MutableRefObject<boolean>;
  loading: MutableRefObject<boolean>;
  endPage: MutableRefObject<boolean>;
  page: MutableRefObject<number>;
  refreshDefault: MutableRefObject<boolean>;
  pageRefresh?: boolean;
  status: ListIndicatorStatus;
  stateItems: ObjectState<readonly ItemT[]>;
  handleRefresh(): void;
  handleEndReached(): void;
}

export interface ListLazyActionParam<ItemT, S> {
  data: ItemT[];
  stateData?: ObjectState<readonly ItemT[]>;
  stateUpdate: ObjectState<Date>;
  search?: S;
  refreshing?: boolean | null;
  refreshDefaultEnabled?: boolean;
  limitPerPage: number;
  loadData(
    page: number,
    limitPerPage: number,
    search?: S,
  ): ItemT[] | null | Promise<ItemT[] | null>;
  keyExtractor(item: ItemT, index?: number): string;
  onRefresh?: (() => void) | null;
}

export function useListLazyAction<ItemT, S>({
  data,
  stateData,
  stateUpdate,
  search,
  refreshing,
  refreshDefaultEnabled = true,
  limitPerPage,
  loadData,
  keyExtractor,
  onRefresh,
}: ListLazyActionParam<ItemT, S>): ListLazyAction<ItemT> {
  const stateItems = useDefaultState(data, stateData);
  const update = stateUpdate[1];
  const [items, setItems] = stateItems;
  const initialize = useRef(false);
  const loading = useRef(true);
  const endPage = useRef(false);
  const page = useRef(1);
  const refreshDefault = useRef(false);

  const forceUpdate = useCallback(() => update(new Date()), []);

  const status = useMemo((): ListIndicatorStatus => {
    if (items.length === 0) {
      return initialize.current ? 'empty' : 'initialize';
    }
    if (endPage.current) {
      return 'end_page';
    }
    if (loading.current) {
      return 'loading';
    }

    return 'normal';
  }, [items, initialize.current, endPage.current, loading.current]);

  const pageRefresh = useMemo(
    () =>
      refreshing !== undefined || !refreshDefaultEnabled
        ? undefined
        : refreshDefault.current,
    [refreshing, refreshDefaultEnabled],
  );

  const mergeData = useCallback(
    (responses: ItemT[] | null) => {
      const merge = [...items];

      if (responses) {
        const keys = items.map((item, index) => keyExtractor(item, index));

        for (let index = 0; index < responses.length; index++) {
          const response = responses[index];
          const key = keyExtractor(response);

          if (!keys.includes(key)) {
            keys.push(key);
            merge.push(response);
          }
        }
      }

      return merge;
    },
    [items, keyExtractor],
  );

  const handleLoadData = useCallback(
    async ({merge = true}: ListLazyActionLoad) => {
      loading.current = true;
      initialize.current && forceUpdate();

      const responses = await loadData(page.current, limitPerPage, search);
      const updateData = merge ? mergeData(responses) : responses;

      initialize.current = true;
      refreshDefault.current = false;
      loading.current = false;
      endPage.current = responses === null || responses.length < limitPerPage;

      if (Array.isArray(updateData)) {
        setItems(updateData);
      } else {
        forceUpdate();
      }
    },
    [page.current, limitPerPage, search, loadData, forceUpdate, mergeData],
  );

  const handleSearch = useCallback(() => {
    page.current = 1;

    handleLoadData({merge: false});
  }, [handleLoadData]);

  const handleRefresh = useCallback(() => {
    onRefresh && onRefresh();

    refreshDefault.current = true;
    page.current = 1;

    handleLoadData({merge: false});
  }, [onRefresh, handleLoadData]);

  const handleEndReached = useCallback(() => {
    if (!loading.current && !endPage.current) {
      page.current++;
      handleLoadData({});
    }
  }, [loading.current, endPage.current, page.current, handleLoadData]);

  useEffect(() => {
    if (initialize.current) {
      setItems(data);
    } else {
      handleLoadData({});
    }
  }, [data]);

  useEffect(() => {
    initialize.current && (pageRefresh || refreshing) && handleRefresh();
  }, [pageRefresh, refreshing]);

  useEffect(() => {
    initialize.current && handleSearch();
  }, [search]);

  return {
    initialize,
    loading,
    endPage,
    page,
    stateItems,
    status,
    refreshDefault,
    pageRefresh,
    handleRefresh,
    handleEndReached,
  };
}
