import React, { Component, PropTypes } from 'react'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { connect } from 'react-redux'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

injectTapEventPlugin();

export default class App extends Component {
  constructor(props) {
    super(props)
  }

  render () {
    const { children } = this.props
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div className="main-container">
          { children }
        </div> 
      </MuiThemeProvider>
    )
  }
}

App.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}
