import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  Animated,
  Easing,
  PanResponder,
  Dimensions
} from 'react-native';
import { WaveIndicator } from 'react-native-indicators';
import { LinearGradient } from 'expo';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    // Set up some base dimensions
    this._fullWidth = Dimensions.get('window').width;
    this._fullHeight = Dimensions.get('window').height;
    this._defaultWidth = this._fullWidth + 10;
    this._modularWidth = this._fullWidth - 100;
    this._halfHeight = Math.ceil(this._fullHeight / 2);
    this._bgHeight = this._fullHeight - 200;
    this._lastPosition = { x: 0, y: 0 };

    // Animatable elements
    this._bgTop = new Animated.Value();
    this._position = new Animated.ValueXY();
    this._draggieWidth = new Animated.Value(this._defaultWidth);
    this._draggieHeight = new Animated.Value(0);
    this._grabbieOpacity = new Animated.Value(0.5);
    this._movieOpacity = new Animated.Value(0);

    // Intial state
    this.state = {
      debug: '',
    };
  }

  componentWillMount() {
    // Register pan responder
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: this.grabDraggie.bind(this),
      onPanResponderMove: this.moveDraggie.bind(this),
      onPanResponderRelease: this.releaseDraggie.bind(this)
    });

    // Set initial UI position
    this.moveUI(0, 0);

    // Reveal draggie
    Animated.timing(this._draggieHeight, {
      toValue: 80,
      easing: Easing.out(Easing.exp),
      duration: 600
    }).start();
  }

  grabDraggie(e, gesture) {
    Animated.parallel([
      Animated.timing(this._movieOpacity, {
        toValue: 1,
        easing: Easing.ease,
        duration: 200
      }),
      Animated.spring(this._draggieWidth, {
        toValue: this._modularWidth,
        friction: 5
      })
    ]).start();
  }

  moveDraggie(e, gesture) {
    this.moveUI(gesture.dx, gesture.dy);
  }

  releaseDraggie(e, gesture) {
    this.snapIntoPlace(gesture);
  }

  // Calculate positional offsets for paralax effect
  calculateNewPosition(dragX, dragY, offsetX, offsetY) {
    const bgOffset = ((this._fullHeight - this._bgHeight) / 2);
    const newPosition = {
      draggieX: (offsetX + dragX),
      draggieY: (offsetY + dragY),
      backgroundY: (((offsetY + dragY) / 2) + bgOffset)
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
    const newPosition = this.calculateNewPosition(0, 0, 0, 0);

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
      }),
      Animated.spring(this._draggieWidth, {
        toValue: this._defaultWidth,
        friction: 50
      }),
      Animated.timing(this._movieOpacity, {
        toValue: 0,
        easing: Easing.ease,
        duration: 200
      }),
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
      width: this._draggieWidth,
      height: this._draggieHeight
    };
    const grabbieStyle = {
      ...styles.grabbie
    };
    const movieStyle = {
      ...styles.movie,
      opacity: this._movieOpacity
    };
    const indicatorStyle = {
      ...styles.indicator,
      opacity: .7
    };

    if (this.state.debug) {
      console.log(this.state.debug);
    }
    
    return (
      <View style={styles.container}>
        <Animated.View style={bgWrapperStyle}>
          <LinearGradient colors={['#ccc', '#ddd', '#eee']} style={styles.background} />
        </Animated.View>
        <Animated.View {...this._panResponder.panHandlers} style={draggieStyle}>
          <Animated.View style={movieStyle} />
          <View style={grabbieStyle}>
            <Animated.View style={indicatorStyle}>
              <WaveIndicator color="#fff" count={2} waveFactor={0.4} />
            </Animated.View>
            <Text style={styles.innerText}>Grab me</Text>
          </View>
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
    alignItems: 'center',
    justifyContent: 'center'
  },
  grabbie: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
    borderRadius: 5,
    opacity: .4,
  },
  movie: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  innerText: {
    color: '#eee',
    fontSize: 24
  },
  indicator: {
    paddingRight: 10,
    //backgroundColor: '#0dd',
    width: 50
  },
});
