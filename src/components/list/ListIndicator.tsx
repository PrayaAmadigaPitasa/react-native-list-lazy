import React from 'react';
import {View, ActivityIndicator, StyleSheet, ViewStyle} from 'react-native';
import {ListIndicatorStatus, ObjectElement} from '@types';

/**
 * @description base of list indicator props,
 * use UpperCamelCase just to follow react-native naming
 * style for component props of list and section list
 */
export interface ListIndicatorBaseProps {
  ListInitializeComponent?: ObjectElement;
  ListInitializeComponentStyle?: ViewStyle;
  ListEmptyComponent?: ObjectElement;
  ListEmptyComponentStyle?: ViewStyle;
  ListLoadingComponent?: ObjectElement;
  ListLoadingComponentStyle?: ViewStyle;
  ListEndPageComponent?: ObjectElement;
  ListEndPageComponentStyle?: ViewStyle;
}

export interface ListIndicatorProps extends ListIndicatorBaseProps {
  status?: ListIndicatorStatus;
}

export default function ListIndicator({
  status,
  ListInitializeComponent,
  ListInitializeComponentStyle,
  ListEmptyComponent,
  ListEmptyComponentStyle,
  ListLoadingComponent,
  ListLoadingComponentStyle,
  ListEndPageComponent,
  ListEndPageComponentStyle,
}: ListIndicatorProps) {
  if (status === 'initialize' && ListInitializeComponent) {
    return (
      <View style={ListInitializeComponentStyle}>
        {ListInitializeComponent}
      </View>
    );
  }
  if (status === 'empty' && ListEmptyComponent) {
    return <View style={ListEmptyComponentStyle}>{ListEmptyComponent}</View>;
  }
  if (status === 'end_page' && ListEndPageComponent) {
    return (
      <View style={ListEndPageComponentStyle}>{ListEndPageComponent}</View>
    );
  }
  if (status === 'loading') {
    return (
      <View
        style={StyleSheet.flatten([styles.loading, ListLoadingComponentStyle])}>
        {ListLoadingComponent || <ActivityIndicator size="large" />}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loading: {
    width: '100%',
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
