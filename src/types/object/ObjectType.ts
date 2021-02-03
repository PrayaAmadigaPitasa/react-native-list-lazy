import {
  RefObject,
  Dispatch,
  SetStateAction,
  ComponentType,
  ReactElement,
} from 'react';

export type ObjectRef<T> = RefObject<T> | null | ((instance: T | null) => void);
export type ObjectKey = string | number;
export type ObjectState<S> = [S, Dispatch<SetStateAction<S>>];
export type ObjectElement = ComponentType<any> | ReactElement | null;
