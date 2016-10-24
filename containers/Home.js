import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class Home extends Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div className='home'>
        Hello world
      </div>
    )
  }
}



export default connect()(Home)
