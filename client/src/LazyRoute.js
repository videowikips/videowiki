import React, { PropTypes } from 'react';
import Loadable from 'react-loadable';
import {
  Route,
} from 'react-router-dom'
import LoaderOverlay from './components/common/LoaderOverlay';

class LazyRoute extends React.Component {

  shouldComponentUpdate(nextProps) {
    return this.props.path !== nextProps.path;
  }

  render() {
    const { loader, ...rest } = this.props;
    const LoadableComponent = Loadable({
      loader,
      loading: () => <LoaderOverlay loaderImage="/img/edit-loader.gif" />,
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
