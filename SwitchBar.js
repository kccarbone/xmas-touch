import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo';

export default class SwitchBar extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Animated.View style={styles.backgroundWrapper}>
          <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.background} />
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 100,
    height: '100%',
    width: '100%',
  },
  background: {
    height: '100%',
    width: '100%',
  },
});
