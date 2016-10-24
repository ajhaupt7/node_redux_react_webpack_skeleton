import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import routes from '../routes'
import DevTools from './DevTools'
import { Router } from 'react-router'
import '../styles/app.scss'
import { connect } from 'react-redux'
import Perf from 'react-addons-perf';

class Root extends Component {
  constructor() {
    super()
  }

  componentWillMount() {
    window.Perf = Perf
  }

  render() {
    const { store, history } = this.props
    return (
      <Provider store={store} >
        <div id="root" >
          <Router history={history} >
            { routes }
          </Router>
          <DevTools />
        </div>
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

export default connect()(Root)
