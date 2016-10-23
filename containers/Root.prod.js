import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import routes from '../routes'
import { Router } from 'react-router'
import '../styles/app.scss'
import { connect } from 'react-redux'

class Root extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { store, history } = this.props
    return (
      <Provider store={store} >
        <div id="root" >
          <Router history={history} >
            { routes }
          </Router>       
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
