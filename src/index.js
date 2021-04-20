import React, { Component } from 'react'
import { string, number, element, oneOfType, arrayOf, bool } from 'prop-types'
import { View, Animated } from 'react-native'

import Svg, {
  G,
  LinearGradient,
  Rect,
  ClipPath,
  Defs,
  Stop,
} from 'react-native-svg'

const AnimatedSvg = Animated.createAnimatedComponent(Svg)
const { interpolate } = require('d3-interpolate')

export default class ContentLoader extends Component {
  static offsetValueBound = (x) => {
    if (x > 1) {
      return '1'
    }
    if (x < 0) {
      return '0'
    }
    return x
  }
  constructor(props) {
    super(props)

    this.state = {
      offsetValues: [
        '-2', '-1.5', '-1',
      ],
      offsets: [
        '0.0001', '0.0002', '0.0003', // Avoid duplicate value cause error in Android
      ],
    }
    this.animate = new Animated.Value(0)
    this.animate.addListener(this.animationListener)
    this.loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.animate, {
          toValue: 1,
          duration: this.props.duration,
          useNativeDriver: true,
        }),
        Animated.timing(this.animate, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]))
  }

  componentDidMount() {
    this.loopAnimation.start()
  }

  componentWillUnmount() {
    this.animate.removeAllListeners()
    this.loopAnimation.stop()
  }

  animationListener = (anim) => {
    const interpolator = interpolate(this.state, {
      offsetValues: ['1.2', '1.7', '2.2'],
    })
    const newState = interpolator(anim.value)
    const offsetValues = []
    offsetValues[0] = ContentLoader.offsetValueBound(newState.offsetValues[0])
    offsetValues[1] = ContentLoader.offsetValueBound(newState.offsetValues[1])
    offsetValues[2] = ContentLoader.offsetValueBound(newState.offsetValues[2])

    if (offsetValues[0] !== offsetValues[1] ||
      offsetValues[0] !== offsetValues[2] ||
      offsetValues[1] !== offsetValues[2]) {
      this.setState({ offsets: offsetValues })
    }
  }

  render() {
    return (
      <View>
        <AnimatedSvg height={this.props.height} width={this.props.width}>
          <Defs>
            <LinearGradient id="grad" x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2}>
              <Stop
                offset={this.state.offsets[0]}
                stopColor={this.props.primaryColor}
                stopOpacity="1"
              />
              <Stop
                offset={this.state.offsets[1]}
                stopColor={this.props.secondaryColor}
                stopOpacity="1"
              />
              <Stop
                offset={this.state.offsets[2]}
                stopColor={this.props.primaryColor}
                stopOpacity="1"
              />
            </LinearGradient>
            <ClipPath id="clip">
              <G>
                {this.props.children}
              </G>
            </ClipPath>
          </Defs>

          <Rect
            x="0"
            y="0"
            height={this.props.height}
            width={this.props.width}
            fill="url(#grad)"
            clipPath="url(#clip)"
          />
        </AnimatedSvg>
      </View>
    )
  }
}
ContentLoader.propTypes = {
  children: oneOfType([
    element.isRequired,
    arrayOf(oneOfType([
      element,
      bool,
    ]))],
  ).isRequired,
  primaryColor: string,
  secondaryColor: string,
  duration: number,
  width: number,
  height: number,
  x1: string,
  y1: string,
  x2: string,
  y2: string,
}
ContentLoader.defaultProps = {
  primaryColor: '#eeeeee',
  secondaryColor: '#dddddd',
  duration: 2000,
  width: 300,
  height: 200,
  x1: '0',
  y1: '0',
  x2: '100%',
  y2: '0',
}
