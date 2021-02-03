import {useCallback, useState} from 'react';
import {ObjectHookForceUpdateValue, ObjectState} from '@types';

export function useDefaultState<S>(value: S, state?: ObjectState<S>) {
  const defaultState = useState(value);

  return state || defaultState;
}

export function useForceUpdate(
  stateUpdate?: ObjectState<Date>,
): ObjectHookForceUpdateValue {
  const [lastUpdate, setLastUpdate] = useDefaultState(new Date(), stateUpdate);

  const handleForceUpdate = useCallback(() => setLastUpdate(new Date()), [
    setLastUpdate,
  ]);

  return {lastUpdate, forceUpdate: handleForceUpdate};
}
