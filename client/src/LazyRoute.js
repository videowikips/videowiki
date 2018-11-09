import React, { PropTypes } from 'react';
import Loadable from 'react-loadable';
import {
  Route,
} from 'react-router-dom'

class LazyRoute extends React.Component {

  render() {
    const { loader, ...rest } = this.props;
    console.log('loader and props', this.props)
    const LoadableComponent = Loadable({
      loader,
      loading: () => <span>Loading...</span>,
    });

    return (
      <Route {...rest} component={LoadableComponent} />
    )
  }
}

LazyRoute.propTypes = {
  loader: PropTypes.func.isRequired,
}

export default LazyRoute;
