webpackJsonp([5],{1477:function(e,t,n){(function(e){!function(){var t=n(17),r=n(18),o=n(13),a=n(0);e.makeHot=e.hot.data?e.hot.data.makeHot:t(function(){return r.getRootInstances(o)},a)}();try{(function(){"use strict";function e(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var l=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),i=n(0),s=e(i),c=n(85),u=n(225),f=n(1502),p=e(f),d=n(1493),h=e(d),y=n(509),m=e(y),b=function(e){function t(e){r(this,t);var n=o(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return n.state={offset:0},n.handleOnScroll=n.handleOnScroll.bind(n),n}return a(t,e),l(t,[{key:"componentWillMount",value:function(){var e=this.state.offset;this.props.dispatch(m.default.fetchAllArticles({offset:e}))}},{key:"componentDidMount",value:function(){window.addEventListener("scroll",this.handleOnScroll)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("scroll",this.handleOnScroll)}},{key:"querySearchResult",value:function(){var e=this;"loading"!==this.props.fetchAllArticlesState&&this._hasMore()&&this.setState({offset:this.state.offset+10},function(){e.props.dispatch(m.default.fetchDeltaArticles({offset:e.state.offset}))})}},{key:"handleOnScroll",value:function(){var e=document.documentElement&&document.documentElement.scrollTop||document.body.scrollTop,t=document.documentElement&&document.documentElement.scrollHeight||document.body.scrollHeight,n=document.documentElement.clientHeight||window.innerHeight;Math.ceil(e+n)>=t-100&&this.querySearchResult()}},{key:"_renderArticles",value:function(){return this.props.allArticles.map(function(e){var t=e.image,n=e.title,r=e._id,o=e.wikiSource;console.log(e);var a="/videowiki/"+n+"?wikiSource="+o;return s.default.createElement(u.Grid.Column,{width:4,key:r,style:{margin:"1rem 0"}},s.default.createElement(p.default,{url:a,image:t,title:n}))})}},{key:"_hasMore",value:function(){return 10===this.props.deltaArticles.length}},{key:"_renderLoader",value:function(){return"loading"===this.props.fetchDeltaArticlesState?s.default.createElement(u.Loader,{size:"large",active:!0,inverted:!0}):null}},{key:"_render",value:function(){return s.default.createElement("div",{className:"c-app-card-layout"},s.default.createElement("h2",{className:"u-text-center"},"All Articles"),s.default.createElement(u.Grid,null,this._renderArticles(),this._renderLoader()))}},{key:"render",value:function(){var e=this,t=this.props.fetchAllArticlesState;return s.default.createElement(h.default,{componentState:t,loaderMessage:"Hold Tight! Loading all articles...",errorMessage:"Error while loading articles! Please try again later!",onRender:function(){return e._render()}})}}]),t}(i.Component);b.propTypes={dispatch:i.PropTypes.func.isRequired,fetchAllArticlesState:i.PropTypes.string,fetchDeltaArticlesState:i.PropTypes.string,allArticles:i.PropTypes.array,deltaArticles:i.PropTypes.array};var g=function(e){return Object.assign({},e.article)};t.default=(0,c.connect)(g)(b)}).call(this)}finally{!function(){var t=e.hot.data&&e.hot.data.foundReactClasses||!1;if(e.exports&&e.makeHot){n(19)(e,n(0))&&(t=!0);t&&e.hot.accept(function(e){e&&console.error("Cannot apply hot update to AllArticles.js: "+e.message)})}e.hot.dispose(function(n){n.makeHot=e.makeHot,n.foundReactClasses=t})}()}}).call(t,n(12)(e))},1493:function(e,t,n){(function(e){!function(){var t=n(17),r=n(18),o=n(13),a=n(0);e.makeHot=e.hot.data?e.hot.data.makeHot:t(function(){return r.getRootInstances(o)},a)}();try{(function(){"use strict";function e(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var l=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),i=n(0),s=e(i),c=n(225),u=n(1494),f=e(u),p=function(e){function t(){return r(this,t),o(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return a(t,e),l(t,[{key:"render",value:function(){var e=this.props,t=e.componentState,n=e.loaderMessage,r=e.errorMessage,o=e.onRender;switch(t){case"done":return o();case"loading":return this.props.loaderDisabled?null:s.default.createElement(f.default,{loaderImage:this.props.loaderImage},n);case"failed":return s.default.createElement(c.Message,{color:"red",size:"massive"},r);default:return this.props.loaderDisabled?null:s.default.createElement(f.default,{loaderImage:this.props.loaderImage})}}}]),t}(i.Component);t.default=p,p.propTypes={componentState:i.PropTypes.string.isRequired,loaderImage:i.PropTypes.string,loaderDisabled:i.PropTypes.bool,loaderMessage:i.PropTypes.string.isRequired,errorMessage:i.PropTypes.string.isRequired,onRender:i.PropTypes.func.isRequired}}).call(this)}finally{!function(){var t=e.hot.data&&e.hot.data.foundReactClasses||!1;if(e.exports&&e.makeHot){n(19)(e,n(0))&&(t=!0);t&&e.hot.accept(function(e){e&&console.error("Cannot apply hot update to StateRenderer.js: "+e.message)})}e.hot.dispose(function(n){n.makeHot=e.makeHot,n.foundReactClasses=t})}()}}).call(t,n(12)(e))},1494:function(e,t,n){(function(e){!function(){var t=n(17),r=n(18),o=n(13),a=n(0);e.makeHot=e.hot.data?e.hot.data.makeHot:t(function(){return r.getRootInstances(o)},a)}();try{(function(){"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function r(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(0),i=function(e){return e&&e.__esModule?e:{default:e}}(l),s=n(225),c=function(t){function n(){return e(this,n),r(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return o(n,t),a(n,[{key:"render",value:function(){return this.props.loaderImage?i.default.createElement(s.Dimmer,{active:!0,inverted:!0},i.default.createElement(s.Image,{src:this.props.loaderImage,size:"small"}),i.default.createElement("h3",null,this.props.children)):i.default.createElement(s.Dimmer,{active:!0,inverted:!0},i.default.createElement(s.Loader,{size:"large",active:!0,inverted:!0},this.props.children))}}]),n}(l.Component);t.default=c,c.propTypes={children:l.PropTypes.node,loaderImage:l.PropTypes.string}}).call(this)}finally{!function(){var t=e.hot.data&&e.hot.data.foundReactClasses||!1;if(e.exports&&e.makeHot){n(19)(e,n(0))&&(t=!0);t&&e.hot.accept(function(e){e&&console.error("Cannot apply hot update to LoaderOverlay.js: "+e.message)})}e.hot.dispose(function(n){n.makeHot=e.makeHot,n.foundReactClasses=t})}()}}).call(t,n(12)(e))},1502:function(e,t,n){(function(e){!function(){var t=n(17),r=n(18),o=n(13),a=n(0);e.makeHot=e.hot.data?e.hot.data.makeHot:t(function(){return r.getRootInstances(o)},a)}();try{(function(){"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function r(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(0),i=function(e){return e&&e.__esModule?e:{default:e}}(l),s=n(225),c=n(108),u=function(t){function n(){return e(this,n),r(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return o(n,t),a(n,[{key:"render",value:function(){var e=this.props,t=e.url,n=e.image,r=e.title,o=e.className,a=o||"c-app-card";return i.default.createElement(c.Link,{to:t},i.default.createElement(s.Card,{className:a},i.default.createElement(s.Image,{src:n}),i.default.createElement(s.Card.Content,null,i.default.createElement(s.Card.Header,null,r.split("_").join(" ")))))}}]),n}(l.Component);t.default=u,u.propTypes={url:l.PropTypes.string,image:l.PropTypes.string,title:l.PropTypes.string,className:l.PropTypes.string}}).call(this)}finally{!function(){var t=e.hot.data&&e.hot.data.foundReactClasses||!1;if(e.exports&&e.makeHot){n(19)(e,n(0))&&(t=!0);t&&e.hot.accept(function(e){e&&console.error("Cannot apply hot update to ArticleCard.js: "+e.message)})}e.hot.dispose(function(n){n.makeHot=e.makeHot,n.foundReactClasses=t})}()}}).call(t,n(12)(e))}});