/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useCallback} from 'react';
import {
  FlatList,
  FlatListProps,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutRectangle,
  LayoutChangeEvent,
} from 'react-native';
import {
  LIST_LOAD_END_THRESHOLD,
  LIST_HORIZONTAL_SCROLL,
  LIST_VERTICAL_SCROLL,
  LIST_DECELERATION_RATE,
} from '@constants';
import {ObjectRef} from '@types';

export interface ListBaseProps<ItemT> extends FlatListProps<ItemT> {
  keyExtractor: (item: ItemT, index: number) => string;
  refList?: ObjectRef<FlatList<ItemT>>;
  onEndReachedThreshold?: number;
}

export default function ListBase<ItemT>({
  refList,
  horizontal,
  data,
  showsVerticalScrollIndicator = LIST_VERTICAL_SCROLL,
  showsHorizontalScrollIndicator = LIST_HORIZONTAL_SCROLL,
  decelerationRate = LIST_DECELERATION_RATE,
  onScroll,
  onEndReached,
  onEndReachedThreshold = LIST_LOAD_END_THRESHOLD,
  onLayout,
  ...props
}: ListBaseProps<ItemT>) {
  const [endZone, setEndZone] = useState(false);
  const [layout, setLayout] = useState<LayoutRectangle>();

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll && onScroll(event);

      if (onEndReached && layout) {
        const {contentOffset, contentSize} = event.nativeEvent;
        const offset = horizontal ? contentOffset.x : contentOffset.y;
        const layoutRelative = horizontal ? layout.width : layout.height;
        const size = horizontal ? contentSize.width : contentSize.height;
        const dif = size - offset - layoutRelative;

        if (!endZone && dif <= onEndReachedThreshold) {
          onEndReached({distanceFromEnd: dif});
          setEndZone(true);
        } else if (endZone && dif > onEndReachedThreshold) {
          setEndZone(false);
        }
      }
    },
    [
      horizontal,
      onEndReachedThreshold,
      layout,
      endZone,
      onScroll,
      onEndReached,
    ],
  );

  useEffect(() => {
    endZone && setEndZone(false);
  }, [data]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onLayout && onLayout(event);
      setLayout(event.nativeEvent.layout);
    },
    [onLayout],
  );

  return (
    <FlatList
      {...props}
      ref={refList}
      data={data}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onLayout={handleLayout}
      onScroll={handleScroll}
      onEndReached={undefined}
      onEndReachedThreshold={undefined}
      decelerationRate={decelerationRate}
    />
  );
}
