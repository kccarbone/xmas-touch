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

    // API params
    this._apiBase = 'http://10.0.0.61/api/97B53A9ADC';

    // Set up some base dimensions
    this._fullWidth = Dimensions.get('window').width;
    this._fullHeight = Dimensions.get('window').height;
    this._defaultWidth = this._fullWidth + 10;
    this._modularWidth = this._fullWidth - 150;
    this._halfHeight = Math.ceil(this._fullHeight / 2);
    this._bgHeight = this._fullHeight + 400;
    this._lastPosition = { x: 0, y: 0 };
    this._currentOnState = false;

    // Animatable elements
    this._bgTop = new Animated.Value();
    this._position = new Animated.ValueXY();
    this._draggieWidth = new Animated.Value(this._defaultWidth);
    this._draggieHeight = new Animated.Value(0);
    this._indicatorWidth = new Animated.Value(50);
    this._indicatorOpacity = new Animated.Value(1);
    this._grabbieOpacity = new Animated.Value(0.4);

    // Intial state
    this.state = {
      currentText: 'Loading',
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
    Animated.spring(this._draggieHeight, {
      toValue: 80,
      friction: 10
    }).start();

    // Init with api
    setTimeout(this.fetchInfo.bind(this), 1000);
  }

  // Get basic light info
  async fetchInfo(url) {
    const light1info = await this.getJson('/lights/1');
    
    if (light1info.state.on) {
      this.turnLightsOn();
    }
    else {
      this.turnLightsOff();
    }
  }

  async turnLightsOn() {
    this.setState({ currentText: '🎄 Christmas time! 🌟' });
    this.snapIntoPlace(true);

    await this.setLightState(1, true);
    await this.setLightState(2, true, 500);
    await this.setLightState(3, true, 500);
    await this.setLightState(4, true, 500);
    await this.setLightState(5, true, 500);
  }

  async turnLightsOff() {
    this.setState({ currentText: 'All quiet 💤' });
    this.snapIntoPlace(false);

    await this.setLightState(1, false);
    await this.setLightState(2, false, 500);
    await this.setLightState(3, false, 500);
    await this.setLightState(4, false, 500);
    await this.setLightState(5, false, 500);
  }

  // Ajax functions
  async getJson(url) {
    const request = await fetch(this._apiBase + url);
    return await request.json();
  }

  async putJson(url, body) {
    const request = await fetch(this._apiBase + url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    return await request.json();
  }

  async setLightState(lightNum, newState, delay) {
    return new Promise(resolve => {
      setTimeout(async () => {
        await this.putJson(`/lights/${lightNum}/state`, { on: newState });
        resolve();
      }, (delay || 0))
    });
  }

  // UI functions
  grabDraggie(e, gesture) {
    this.setState({ currentText: 'Wheeee!' });
    Animated.parallel([
      Animated.spring(this._draggieWidth, {
        toValue: this._modularWidth,
        friction: 5
      }),
      Animated.timing(this._grabbieOpacity, {
        toValue: 0.5,
        easing: Easing.ease,
        duration: 5
      }),
    ]).start();
  }

  moveDraggie(e, gesture) {
    this.moveUI(gesture.dx, gesture.dy);
  }

  releaseDraggie(e, gesture) {
    this.setState({ debug: { ...gesture } });

    if (gesture.vy < -1) {
      this.turnLightsOn();
    }
    else if (gesture.vx > 1) {
      this.turnLightsOff();
    }
    else if (gesture.moveY < this._halfHeight) {
      this.turnLightsOn();
    }
    else if (gesture.moveY > this._halfHeight) {
      this.turnLightsOff();
    }
    else {
      this.snapIntoPlace(this._currentOnState);
    }
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
  snapIntoPlace(onPosition) {
    // OFF position
    let newPosition = this.calculateNewPosition(0, 250, 0, 0);

    if (onPosition) {
      // ON position
      newPosition = this.calculateNewPosition(0, -250, 0, 0);
    }

    this._currentOnState = onPosition;
    this._lastPosition = {
      x: newPosition.draggieX,
      y: newPosition.draggieY
    };

    Animated.parallel([
      Animated.spring(this._position, {
        toValue: {
          x: newPosition.draggieX,
          y: newPosition.draggieY
        },
        friction: 6
      }),
      Animated.spring(this._bgTop, {
        toValue: newPosition.backgroundY,
        friction: 6
      }),
      Animated.spring(this._draggieWidth, {
        toValue: this._defaultWidth,
        friction: 5
      }),
      Animated.timing(this._grabbieOpacity, {
        toValue: onPosition ? 0.8 : 0.4,
        easing: Easing.ease,
        duration: 5
      }),
      Animated.timing(this._indicatorWidth, {
        toValue: 0,
        easing: Easing.ease,
        duration: 5
      }),
      Animated.timing(this._indicatorOpacity, {
        toValue: 0,
        easing: Easing.ease,
        duration: 5
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
      ...styles.grabbie,
      opacity: this._grabbieOpacity
    };
    const indicatorStyle = {
      ...styles.indicator,
      width: this._indicatorWidth,
      opacity: this._indicatorOpacity
    };

    if (this.state.debug) {
      console.log(this.state.debug);
    }
    
    return (
      <View style={styles.container}>
        <Animated.View style={bgWrapperStyle}>
          <LinearGradient colors={['#111122', '#111122', '#111166', '#49d882', '#f9c157']} style={styles.background} />
        </Animated.View>
        <Animated.View {...this._panResponder.panHandlers} style={draggieStyle}>
          <Animated.View style={grabbieStyle}>
            <Animated.View style={indicatorStyle}>
              <WaveIndicator color="#222" count={2} waveFactor={0.4} />
            </Animated.View>
            <Text style={styles.innerText}>{this.state.currentText}</Text>
          </Animated.View>
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
    backgroundColor: '#ccc',
    shadowColor: '#333',
    shadowOffset: {
      width: 2,
      height: 2
    },
    shadowRadius: 6,
    shadowOpacity: 0.8,
    borderRadius: 5
  },
  innerText: {
    color: '#222',
    fontSize: 24
  },
  indicator: {
    paddingRight: 10,
    //backgroundColor: '#0dd',
    width: 50
  },
});
