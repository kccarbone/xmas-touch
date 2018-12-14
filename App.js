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

    // Set up some base dimensions
    this._fullWidth = Dimensions.get('window').width;
    this._fullHeight = Dimensions.get('window').height;
    this._halfHeight = Math.ceil(this._fullHeight / 2);
    this._bgHeight = this._fullHeight + 200;
    this._draggieHeight = 80;
    this._lastPosition = { x: 0, y: this._halfHeight };

    // Animatable elements
    this._bgTop = new Animated.Value();
    this._position = new Animated.ValueXY();

    // Intial state
    this.state = {
      debug: '',
    };
  }

  componentWillMount() {
    // Register pan responder
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderMove: (e, gesture) => { 
        this.moveUI(gesture.dx, gesture.dy);
      },
      onPanResponderRelease: (e, gesture) => { 
        this.snapIntoPlace(gesture);
        this.setState({ debug: { ...gesture } });
      }
    });

    // Set initial UI position
    this.moveUI(0, 0);
  }

  // Calculate positional offsets for paralax effect
  calculateNewPosition(dragX, dragY, offsetX, offsetY) {
    const draggieOffset = (this._draggieHeight / 2 * -1);
    const bgOffset = ((offsetY + dragY - this._halfHeight) / 2);
    const newPosition = {
      draggieX: (offsetX + dragX),
      draggieY: (offsetY + dragY + draggieOffset),
      backgroundY: ((this._fullHeight - this._bgHeight) / 2) + bgOffset
    };

    return newPosition;
  }

  // Apply single-frame animation
  moveUI(dragX, dragY) {
    const newPosition = this.calculateNewPosition(
      dragX,
      dragY,
      this._lastPosition.x,
      this._lastPosition.y
    );

    Animated.event([{
      draggieX: this._position.x,
      draggieY: this._position.y,
      backgroundY: this._bgTop
    }])(newPosition);
  }

  // Apply spring animation
  snapIntoPlace(gesture) {
    const newPosition = this.calculateNewPosition(0, this._halfHeight, 0, 0);

    Animated.parallel([
      Animated.spring(this._position, {
        toValue: {
          x: newPosition.draggieX,
          y: newPosition.draggieY
        },
        friction: 50
      }),
      Animated.spring(this._bgTop, {
        toValue: newPosition.backgroundY,
        friction: 50
      })
    ]).start();
  }

  // Render it!
  render() {
    const bgWrapperStyle = {
      ...styles.backgroundWrapper,
      top: this._bgTop,
      height: this._bgHeight
    };
    const draggieStyle = {
      ...styles.draggie,
      ...this._position.getLayout(),
      height: this._draggieHeight
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
    width: '100%',
  },
  background: {
    height: '100%',
    width: '100%',
  },
  draggie: {
    position: 'absolute',
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
