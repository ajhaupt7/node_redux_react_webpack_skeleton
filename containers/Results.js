import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { setBackgroundStyles, pauseSong, getTrackData, resetErrors } from '../actions' 
import ResultsHeader from '../components/ResultsHeader'
import Errors from '../components/Errors'
import EventsContainer from '../components/EventsContainer'
import MenuBar from './MenuBar'
import FetchSongs from './FetchSongs'
import CircularProgress from 'material-ui/CircularProgress'
import Paper from 'material-ui/Paper'
import customShallowCompare from '../helpers/customShallowCompare'
import '../styles/results.scss'

class Results extends Component {
  constructor(props) {
    super(props)
    
    this.spacebarPlay = this.spacebarPlay.bind(this)
    this.renderErrors  = this.renderErrors.bind(this)
    this.closeErrors  = this.closeErrors.bind(this)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const ignoreProps = ['routeParams']
    return customShallowCompare(this, nextProps, nextState, ignoreProps);
  }

  componentDidMount() {
    const { dispatch } = this.props
    document.addEventListener("keydown", this.spacebarPlay);
  }

  componentWillUnmount() {
    const { songPlaying, dispatch } = this.props
    document.removeEventListener('keydown', this.spacebarPlay);
    if (songPlaying) dispatch(pauseSong())
  }


  closeErrors() {
    const { dispatch, submissionError } = this.props
    if (submissionError) this.context.router.push('/')
    dispatch(resetErrors())
  }

  renderErrors() {
    const { submissionError, songFetchError } = this.props
    const error = submissionError ? submissionError : songFetchError
    if (error) {
      return (
        <Errors 
          errors      = { error } 
          open        = { error ? true : false }
          handleClose = { this.closeErrors }
          position    = { 'top' }
        />
      )
    }
  }

  renderSpinner() {
    const { submitted, primaryColor } = this.props
    if (submitted) {
      return (
        <div className="spinner">
          <CircularProgress size={1.3} color={ primaryColor } />
        </div>
      )
    }
  }

  spacebarPlay(e) {
    const { songPlaying, dispatch } = this.props
    e.preventDefault();
    if ((e.keyCode == 0 || e.keyCode == 32) && songPlaying) dispatch(pauseSong())
  }

  render() {
    const { date, city, primaryColor, events } = this.props
    return (
      <div className='results'>
        <div className='top-wrapper'>
          <ResultsHeader 
            date = { date }
            city = { city }
          />
          <MenuBar 
            borderColor = { primaryColor }
            results     = { true }
          />
        </div>
        <FetchSongs /> 
        { this.renderSpinner() }
        { this.renderErrors() }
        <EventsContainer primaryColor={primaryColor} events={events} />
      </div>
    )
  }
}

Results.contextTypes = {
  router: React.PropTypes.object.isRequired
};

Results.PropTypes = {
  date            : PropTypes.any.isRequired,
  city            : PropTypes.string.isRequired,
  primaryColor    : PropTypes.arrayOf(PropTypes.number).isRequired,
  songPlaying     : PropTypes.bool.isRequired,
  songFetchError  : PropTypes.bool,
  submissionError : PropTypes.bool,
  events          : PropTypes.arrayOf(PropTypes.number).isRequired,
  submitted       : PropTypes.bool.isRequired,
}

function mapStateToProps(state) {
  const songPlaying = state.results.songPlaying != null ? true : false
  return {
    date: state.formData.date,
    city: state.formData.city,
    primaryColor: state.backgroundStyles.primaryColor,
    songPlaying: songPlaying,
    songFetchError: state.fetchSongs.error,
    submissionError: state.homeData.submissionErrors,
    events: state.concerts.renderedEvents,
    submitted: state.homeData.submitted
  }
}

export default connect(mapStateToProps)(Results)
