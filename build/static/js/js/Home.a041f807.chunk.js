webpackJsonp([5],{1028:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=i(n(2)),a=i(n(3)),o=(i(n(4)),i(n(0))),l=n(5);function i(e){return e&&e.__esModule?e:{default:e}}function u(e){var t=e.children,n=e.className,i=e.computer,c=e.color,s=e.floated,d=e.largeScreen,f=e.mobile,p=e.only,m=e.stretched,y=e.tablet,h=e.textAlign,b=e.verticalAlign,v=e.widescreen,g=e.width,_=(0,a.default)(c,(0,l.useKeyOnly)(m,"stretched"),(0,l.useOnlyProp)(p,"only"),(0,l.useTextAlignProp)(h),(0,l.useValueAndKey)(s,"floated"),(0,l.useVerticalAlignProp)(b),(0,l.useWidthProp)(i,"wide computer"),(0,l.useWidthProp)(d,"wide large screen"),(0,l.useWidthProp)(f,"wide mobile"),(0,l.useWidthProp)(y,"wide tablet"),(0,l.useWidthProp)(v,"wide widescreen"),(0,l.useWidthProp)(g,"wide"),"column",n),E=(0,l.getUnhandledProps)(u,e),O=(0,l.getElementType)(u,e);return o.default.createElement(O,(0,r.default)({},E,{className:_}),t)}u.handledProps=["as","children","className","color","computer","floated","largeScreen","mobile","only","stretched","tablet","textAlign","verticalAlign","widescreen","width"],u._meta={name:"GridColumn",parent:"Grid",type:l.META.TYPES.COLLECTION},t.default=u},1029:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});i(n(141));var r=i(n(2)),a=i(n(3)),o=(i(n(4)),i(n(0))),l=n(5);function i(e){return e&&e.__esModule?e:{default:e}}function u(e){var t=e.centered,n=e.children,i=e.className,c=e.color,s=e.columns,d=e.divided,f=e.only,p=e.reversed,m=e.stretched,y=e.textAlign,h=e.verticalAlign,b=(0,a.default)(c,(0,l.useKeyOnly)(t,"centered"),(0,l.useKeyOnly)(d,"divided"),(0,l.useKeyOnly)(m,"stretched"),(0,l.useOnlyProp)(f),(0,l.useTextAlignProp)(y),(0,l.useValueAndKey)(p,"reversed"),(0,l.useVerticalAlignProp)(h),(0,l.useWidthProp)(s,"column",!0),"row",i),v=(0,l.getUnhandledProps)(u,e),g=(0,l.getElementType)(u,e);return o.default.createElement(g,(0,r.default)({},v,{className:b}),n)}u.handledProps=["as","centered","children","className","color","columns","divided","only","reversed","stretched","textAlign","verticalAlign"],u._meta={name:"GridRow",parent:"Grid",type:l.META.TYPES.COLLECTION},t.default=u},1049:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=d(n(2)),a=d(n(19)),o=d(n(3)),l=(d(n(4)),d(n(0))),i=n(5),u=d(n(901)),c=d(n(902)),s=d(n(903));function d(e){return e&&e.__esModule?e:{default:e}}function f(e){var t=e.children,n=e.className,d=e.description,p=e.extra,m=e.header,y=e.meta,h=(0,o.default)(n,(0,i.useKeyOnly)(p,"extra"),"content"),b=(0,i.getUnhandledProps)(f,e),v=(0,i.getElementType)(f,e);return(0,a.default)(t)?l.default.createElement(v,(0,r.default)({},b,{className:h}),(0,i.createShorthand)(c.default,function(e){return{content:e}},m),(0,i.createShorthand)(s.default,function(e){return{content:e}},y),(0,i.createShorthand)(u.default,function(e){return{content:e}},d)):l.default.createElement(v,(0,r.default)({},b,{className:h}),t)}f.handledProps=["as","children","className","description","extra","header","meta"],f._meta={name:"CardContent",parent:"Card",type:i.META.TYPES.VIEW},t.default=f},1050:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=s(n(2)),a=s(n(97)),o=s(n(19)),l=s(n(3)),i=(s(n(4)),s(n(0))),u=n(5),c=s(n(900));function s(e){return e&&e.__esModule?e:{default:e}}function d(e){var t=e.children,n=e.className,s=e.doubling,f=e.items,p=e.itemsPerRow,m=e.stackable,y=(0,l.default)("ui",(0,u.useKeyOnly)(s,"doubling"),(0,u.useKeyOnly)(m,"stackable"),(0,u.useWidthProp)(p),n,"cards"),h=(0,u.getUnhandledProps)(d,e),b=(0,u.getElementType)(d,e);if(!(0,o.default)(t))return i.default.createElement(b,(0,r.default)({},h,{className:y}),t);var v=(0,a.default)(f,function(e){var t=e.key||[e.header,e.description].join("-");return i.default.createElement(c.default,(0,r.default)({key:t},e))});return i.default.createElement(b,(0,r.default)({},h,{className:y}),v)}d.handledProps=["as","children","className","doubling","items","itemsPerRow","stackable"],d._meta={name:"CardGroup",parent:"Card",type:u.META.TYPES.VIEW},t.default=d},1080:function(e,t,n){"use strict";n.d(t,"a",function(){return y});var r=n(101),a=n.n(r),o=n(900),l=n.n(o),i=n(0),u=n.n(i),c=n(44);function s(e){return(s="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function d(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function f(e,t){return!t||"object"!==s(t)&&"function"!==typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function p(e){return(p=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function m(e,t){return(m=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var y=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),f(this,p(t).apply(this,arguments))}var n,r,o;return function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&m(e,t)}(t,i["Component"]),n=t,(r=[{key:"render",value:function(){var e=this.props,t=e.url,n=e.image,r=e.title,o=e.className||"c-app-card";return u.a.createElement(c.b,{to:t},u.a.createElement(l.a,{className:o},u.a.createElement(a.a,{src:n}),u.a.createElement(l.a.Content,null,u.a.createElement(l.a.Header,null,r.split("_").join(" ")))))}}])&&d(n.prototype,r),o&&d(n,o),t}()},1212:function(e,t,n){"use strict";var r=n(891),a=n.n(r),o=n(0),l=n.n(o),i=n(73),u=n(1080),c=n(882),s=n(221),d=n(1213);function f(e){return(f="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function p(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function m(e,t){return!t||"object"!==f(t)&&"function"!==typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function y(e){return(y=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function h(e,t){return(h=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var b=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),m(this,y(t).apply(this,arguments))}var n,r,i;return function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&h(e,t)}(t,o["Component"]),n=t,(r=[{key:"componentWillMount",value:function(){this.props.dispatch(s.a.fetchTopArticles())}},{key:"_renderArticles",value:function(e){return this.props.topArticles.sort(function(t,n){return e.indexOf(t.title)>e.indexOf(n.title)}).map(function(t){var n=t.image,r=t.title,o=t._id,i=t.wikiSource,c="/videowiki/".concat(r,"?wikiSource=").concat(i);return!!e.some(function(e){return e===t.title})&&l.a.createElement(a.a.Column,{width:3,key:o},l.a.createElement(u.a,{url:c,image:n,title:r.split(":").join(": ")}))})}},{key:"_render",value:function(){var e=this;return l.a.createElement("div",{className:"c-app-card-layout home"},l.a.createElement(a.a,null,d.a.map(function(t,n){return l.a.createElement(a.a.Row,{key:n},l.a.createElement("h2",{className:"section-title"},t.category),e._renderArticles(t.title))})))}},{key:"render",value:function(){var e=this,t=this.props.topArticlesState;return l.a.createElement(c.a,{loaderDisabled:!0,componentState:t,loaderImage:"/img/view-loader.gif",loaderMessage:"Loading your article from the sum of all human knowledge!",errorMessage:"Error while loading articles! Please try again later!",onRender:function(){return e._render()}})}}])&&p(n.prototype,r),i&&p(n,i),t}();t.a=Object(i.b)(function(e){return Object.assign({},e.article)})(b)},1213:function(e,t,n){"use strict";n.d(t,"a",function(){return r});var r=[{category:"Most Viewed",title:["Wikipedia:MEDSKL/Acute_vision_loss","Wikipedia:VideoWiki/Black_Hole","Wikipedia:VideoWiki/Kerala","Wikipedia:VideoWiki/NASA"]},{category:"People",title:["Wikipedia:VideoWiki/Albert_Einstein","Wikipedia:VideoWiki/Barack_Obama","Wikipedia:VideoWiki/Katherine_Maher","Wikipedia:VideoWiki/Mark_Zuckerberg"]},{category:"Places",title:["Wikipedia:VideoWiki/France","Wikipedia:VideoWiki/India","Wikipedia:VideoWiki/United_Kingdom","Wikipedia:VideoWiki/Germany"]}]},862:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),n.d(t,"default",function(){return p});var r=n(98),a=n.n(r),o=n(0),l=n.n(o),i=n(1212);function u(e){return(u="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function c(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function s(e,t){return!t||"object"!==u(t)&&"function"!==typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function d(e){return(d=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function f(e,t){return(f=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var p=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),s(this,d(t).apply(this,arguments))}var n,r,u;return function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&f(e,t)}(t,o["Component"]),n=t,(r=[{key:"render",value:function(){return l.a.createElement("div",{className:"u-page-info u-center"},l.a.createElement("div",{className:"joinUsLogo"},l.a.createElement("p",null,"We are building the video version of Wikipedia.",l.a.createElement("br",null),l.a.createElement("a",{className:"learnmore",target:"_blank",href:"https://medium.com/videowiki/the-hidden-meaning-behind-videowikis-new-logo-ff9e339afd52"},"Learn more"),l.a.createElement("a",{className:"butn detail_button get_started_btn bold supportvidewiki",style:{textDecoration:"none",fontSize:16},href:"https://meta.wikimedia.org/wiki/Wiki_Video",target:"_blank"},l.a.createElement(a.a,{name:"heart"}),"  Support VideoWiki on Meta"))),l.a.createElement(i.a,null))}}])&&c(n.prototype,r),u&&c(n,u),t}()},880:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=u(n(2)),a=u(n(19)),o=u(n(3)),l=(u(n(4)),u(n(0))),i=n(5);function u(e){return e&&e.__esModule?e:{default:e}}function c(e){var t=e.children,n=e.className,u=e.content,s=(0,o.default)("content",n),d=(0,i.getUnhandledProps)(c,e),f=(0,i.getElementType)(c,e);return l.default.createElement(f,(0,r.default)({},d,{className:s}),(0,a.default)(t)?u:t)}c.handledProps=["as","children","className","content"],c._meta={name:"MessageItem",parent:"Message",type:i.META.TYPES.COLLECTION},c.defaultProps={as:"li"},c.create=(0,i.createShorthandFactory)(c,function(e){return{content:e}}),t.default=c},881:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=v(n(2)),a=v(n(20)),o=v(n(21)),l=v(n(22)),i=v(n(23)),u=v(n(19)),c=(v(n(72)),v(n(3))),s=(v(n(4)),n(0)),d=v(s),f=n(5),p=v(n(99)),m=v(n(883)),y=v(n(884)),h=v(n(885)),b=v(n(880));function v(e){return e&&e.__esModule?e:{default:e}}var g=function(e){function t(){var e,n,r,o;(0,a.default)(this,t);for(var i=arguments.length,u=Array(i),c=0;c<i;c++)u[c]=arguments[c];return n=r=(0,l.default)(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(u))),r.handleDismiss=function(e){var t=r.props.onDismiss;t&&t(e,r.props)},o=n,(0,l.default)(r,o)}return(0,i.default)(t,e),(0,o.default)(t,[{key:"render",value:function(){var e=this.props,n=e.attached,a=e.children,o=e.className,l=e.color,i=e.compact,s=e.content,b=e.error,v=e.floating,g=e.header,_=e.hidden,E=e.icon,O=e.info,P=e.list,k=e.negative,w=e.onDismiss,M=e.positive,N=e.size,T=e.success,S=e.visible,C=e.warning,j=(0,c.default)("ui",l,N,(0,f.useKeyOnly)(i,"compact"),(0,f.useKeyOnly)(b,"error"),(0,f.useKeyOnly)(v,"floating"),(0,f.useKeyOnly)(_,"hidden"),(0,f.useKeyOnly)(E,"icon"),(0,f.useKeyOnly)(O,"info"),(0,f.useKeyOnly)(k,"negative"),(0,f.useKeyOnly)(M,"positive"),(0,f.useKeyOnly)(T,"success"),(0,f.useKeyOnly)(S,"visible"),(0,f.useKeyOnly)(C,"warning"),(0,f.useKeyOrValueAndKey)(n,"attached"),"message",o),A=w&&d.default.createElement(p.default,{name:"close",onClick:this.handleDismiss}),K=(0,f.getUnhandledProps)(t,this.props),W=(0,f.getElementType)(t,this.props);return(0,u.default)(a)?d.default.createElement(W,(0,r.default)({},K,{className:j}),A,p.default.create(E),(!(0,u.default)(g)||!(0,u.default)(s)||!(0,u.default)(P))&&d.default.createElement(m.default,null,y.default.create(g),h.default.create(P),(0,f.createHTMLParagraph)(s))):d.default.createElement(W,(0,r.default)({},K,{className:j}),A,a)}}]),t}(s.Component);g._meta={name:"Message",type:f.META.TYPES.COLLECTION},g.Content=m.default,g.Header=y.default,g.List=h.default,g.Item=b.default,g.handledProps=["as","attached","children","className","color","compact","content","error","floating","header","hidden","icon","info","list","negative","onDismiss","positive","size","success","visible","warning"],t.default=g},882:function(e,t,n){"use strict";n.d(t,"a",function(){return p});var r=n(881),a=n.n(r),o=n(0),l=n.n(o),i=n(370);function u(e){return(u="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function c(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function s(e,t){return!t||"object"!==u(t)&&"function"!==typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function d(e){return(d=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function f(e,t){return(f=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var p=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),s(this,d(t).apply(this,arguments))}var n,r,u;return function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&f(e,t)}(t,o["Component"]),n=t,(r=[{key:"render",value:function(){var e=this.props,t=e.componentState,n=e.loaderMessage,r=e.errorMessage,o=e.onRender;switch(t){case"done":return o();case"loading":return this.props.loaderDisabled?null:l.a.createElement(i.a,{loaderImage:this.props.loaderImage},n);case"failed":return l.a.createElement(a.a,{color:"red",size:"massive"},r);default:return this.props.loaderDisabled?null:l.a.createElement(i.a,{loaderImage:this.props.loaderImage})}}}])&&c(n.prototype,r),u&&c(n,u),t}()},883:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=i(n(2)),a=i(n(3)),o=(i(n(4)),i(n(0))),l=n(5);function i(e){return e&&e.__esModule?e:{default:e}}function u(e){var t=e.children,n=e.className,i=(0,a.default)("content",n),c=(0,l.getUnhandledProps)(u,e),s=(0,l.getElementType)(u,e);return o.default.createElement(s,(0,r.default)({},c,{className:i}),t)}u.handledProps=["as","children","className"],u._meta={name:"MessageContent",parent:"Message",type:l.META.TYPES.COLLECTION},t.default=u},884:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=u(n(2)),a=u(n(19)),o=u(n(3)),l=(u(n(4)),u(n(0))),i=n(5);function u(e){return e&&e.__esModule?e:{default:e}}function c(e){var t=e.children,n=e.className,u=e.content,s=(0,o.default)("header",n),d=(0,i.getUnhandledProps)(c,e),f=(0,i.getElementType)(c,e);return l.default.createElement(f,(0,r.default)({},d,{className:s}),(0,a.default)(t)?u:t)}c.handledProps=["as","children","className","content"],c._meta={name:"MessageHeader",parent:"Message",type:i.META.TYPES.COLLECTION},c.create=(0,i.createShorthandFactory)(c,function(e){return{content:e}}),t.default=c},885:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=s(n(2)),a=s(n(97)),o=s(n(19)),l=s(n(3)),i=(s(n(4)),s(n(0))),u=n(5),c=s(n(880));function s(e){return e&&e.__esModule?e:{default:e}}function d(e){var t=e.children,n=e.className,s=e.items,f=(0,l.default)("list",n),p=(0,u.getUnhandledProps)(d,e),m=(0,u.getElementType)(d,e);return i.default.createElement(m,(0,r.default)({},p,{className:f}),(0,o.default)(t)?(0,a.default)(s,c.default.create):t)}d.handledProps=["as","children","className","items"],d._meta={name:"MessageList",parent:"Message",type:u.META.TYPES.COLLECTION},d.defaultProps={as:"ul"},d.create=(0,u.createShorthandFactory)(d,function(e){return{items:e}}),t.default=d},891:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});c(n(141));var r=c(n(2)),a=c(n(3)),o=(c(n(4)),c(n(0))),l=n(5),i=c(n(1028)),u=c(n(1029));function c(e){return e&&e.__esModule?e:{default:e}}function s(e){var t=e.celled,n=e.centered,i=e.children,u=e.className,c=e.columns,d=e.container,f=e.divided,p=e.doubling,m=e.inverted,y=e.padded,h=e.relaxed,b=e.reversed,v=e.stackable,g=e.stretched,_=e.textAlign,E=e.verticalAlign,O=(0,a.default)("ui",(0,l.useKeyOnly)(n,"centered"),(0,l.useKeyOnly)(d,"container"),(0,l.useKeyOnly)(p,"doubling"),(0,l.useKeyOnly)(m,"inverted"),(0,l.useKeyOnly)(v,"stackable"),(0,l.useKeyOnly)(g,"stretched"),(0,l.useKeyOrValueAndKey)(t,"celled"),(0,l.useKeyOrValueAndKey)(f,"divided"),(0,l.useKeyOrValueAndKey)(y,"padded"),(0,l.useKeyOrValueAndKey)(h,"relaxed"),(0,l.useTextAlignProp)(_),(0,l.useValueAndKey)(b,"reversed"),(0,l.useVerticalAlignProp)(E),(0,l.useWidthProp)(c,"column",!0),"grid",u),P=(0,l.getUnhandledProps)(s,e),k=(0,l.getElementType)(s,e);return o.default.createElement(k,(0,r.default)({},P,{className:O}),i)}s.handledProps=["as","celled","centered","children","className","columns","container","divided","doubling","inverted","padded","relaxed","reversed","stackable","stretched","textAlign","verticalAlign"],s.Column=i.default,s.Row=u.default,s._meta={name:"Grid",type:l.META.TYPES.COLLECTION},t.default=s},900:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=g(n(2)),a=g(n(20)),o=g(n(21)),l=g(n(22)),i=g(n(23)),u=g(n(19)),c=g(n(3)),s=(g(n(4)),n(0)),d=g(s),f=n(5),p=g(n(378)),m=g(n(1049)),y=g(n(901)),h=g(n(1050)),b=g(n(902)),v=g(n(903));function g(e){return e&&e.__esModule?e:{default:e}}var _=function(e){function t(){var e,n,r,o;(0,a.default)(this,t);for(var i=arguments.length,u=Array(i),c=0;c<i;c++)u[c]=arguments[c];return n=r=(0,l.default)(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(u))),r.handleClick=function(e){var t=r.props.onClick;t&&t(e,r.props)},o=n,(0,l.default)(r,o)}return(0,i.default)(t,e),(0,o.default)(t,[{key:"render",value:function(){var e=this.props,n=e.centered,a=e.children,o=e.className,l=e.color,i=e.description,s=e.extra,y=e.fluid,h=e.header,b=e.href,v=e.image,g=e.link,_=e.meta,E=e.onClick,O=e.raised,P=(0,c.default)("ui",l,(0,f.useKeyOnly)(n,"centered"),(0,f.useKeyOnly)(y,"fluid"),(0,f.useKeyOnly)(g,"link"),(0,f.useKeyOnly)(O,"raised"),"card",o),k=(0,f.getUnhandledProps)(t,this.props),w=(0,f.getElementType)(t,this.props,function(){if(E)return"a"});return(0,u.default)(a)?d.default.createElement(w,(0,r.default)({},k,{className:P,href:b,onClick:this.handleClick}),p.default.create(v),(i||h||_)&&d.default.createElement(m.default,{description:i,header:h,meta:_}),s&&d.default.createElement(m.default,{extra:!0},s)):d.default.createElement(w,(0,r.default)({},k,{className:P,href:b,onClick:this.handleClick}),a)}}]),t}(s.Component);_._meta={name:"Card",type:f.META.TYPES.VIEW},_.Content=m.default,_.Description=y.default,_.Group=h.default,_.Header=b.default,_.Meta=v.default,_.handledProps=["as","centered","children","className","color","description","extra","fluid","header","href","image","link","meta","onClick","raised"],t.default=_},901:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=u(n(2)),a=u(n(19)),o=u(n(3)),l=(u(n(4)),u(n(0))),i=n(5);function u(e){return e&&e.__esModule?e:{default:e}}function c(e){var t=e.children,n=e.className,u=e.content,s=(0,o.default)(n,"description"),d=(0,i.getUnhandledProps)(c,e),f=(0,i.getElementType)(c,e);return l.default.createElement(f,(0,r.default)({},d,{className:s}),(0,a.default)(t)?u:t)}c.handledProps=["as","children","className","content"],c._meta={name:"CardDescription",parent:"Card",type:i.META.TYPES.VIEW},t.default=c},902:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=u(n(2)),a=u(n(19)),o=u(n(3)),l=(u(n(4)),u(n(0))),i=n(5);function u(e){return e&&e.__esModule?e:{default:e}}function c(e){var t=e.children,n=e.className,u=e.content,s=(0,o.default)(n,"header"),d=(0,i.getUnhandledProps)(c,e),f=(0,i.getElementType)(c,e);return l.default.createElement(f,(0,r.default)({},d,{className:s}),(0,a.default)(t)?u:t)}c.handledProps=["as","children","className","content"],c._meta={name:"CardHeader",parent:"Card",type:i.META.TYPES.VIEW},t.default=c},903:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=u(n(2)),a=u(n(19)),o=u(n(3)),l=(u(n(4)),u(n(0))),i=n(5);function u(e){return e&&e.__esModule?e:{default:e}}function c(e){var t=e.children,n=e.className,u=e.content,s=(0,o.default)(n,"meta"),d=(0,i.getUnhandledProps)(c,e),f=(0,i.getElementType)(c,e);return l.default.createElement(f,(0,r.default)({},d,{className:s}),(0,a.default)(t)?u:t)}c.handledProps=["as","children","className","content"],c._meta={name:"CardMeta",parent:"Card",type:i.META.TYPES.VIEW},t.default=c}});
//# sourceMappingURL=Home.a041f807.chunk.js.map