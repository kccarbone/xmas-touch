import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this._fullWidth = Dimensions.get('window').width + 10;
    this._topOffset = Math.ceil(Dimensions.get('window').height / 2) - 40;
    this._lastPosition = { x: 0, y: this._topOffset };
    this._bgOffset = new Animated.Value();
    this._position = new Animated.ValueXY();

    this.state = {
      debug: '',
    };
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {
        this._position.setOffset({ ...this._lastPosition });
        this._position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (e, gesture) => { 
        this.updateUIOffsets({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (e, gesture) => { 
      }
    });
    this.updateUIOffsets(this._lastPosition);
  }

  updateUIOffsets(newPosition) {
    Animated.event([{ x: this._position.x, y: this._position.y }])(newPosition);
    Animated.event([{ y: this._bgOffset }])({ y: ((newPosition.y / 2) - this._topOffset) });
  }

  render() {
    const bgWrapperStyle = {
      ...styles.backgroundWrapper,
      top: this._bgOffset
    };
    const draggieStyle = {
      ...styles.draggie,
      ...this._position.getLayout(),
    };

    if (this.state.debug) {
      console.log(this.state.debug);
    }
    
    return (
      <View style={styles.container}>
        <Animated.View style={bgWrapperStyle}>
          <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.background} />
        </Animated.View>
        <Animated.View {...this._panResponder.panHandlers} style={draggieStyle}>
          <Text style={styles.draggieText}>Drag Me</Text>
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
  draggie: {
    position: 'absolute',
    top: 100,
    height: 80,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
    opacity: .5,
  },
  draggieText: {
    color: '#eee',
    fontSize: 24
  }
});
