webpackJsonp([11],{1067:function(e,t,n){var r=n(1068)("round");e.exports=r},1068:function(e,t,n){var r=n(38),a=n(145),o=n(80),s=Math.min;e.exports=function(e){var t=Math[e];return function(e,n){if(e=a(e),n=null==n?0:s(r(n),292)){var i=(o(e)+"e").split("e"),l=t(i[0]+"e"+(+i[1]+n));return+((i=(o(l)+"e").split("e"))[0]+"e"+(+i[1]-n))}return t(e)}}},1069:function(e,t,n){var r=n(382),a=n(145);e.exports=function(e,t,n){return void 0===n&&(n=t,t=void 0),void 0!==n&&(n=(n=a(n))===n?n:0),void 0!==t&&(t=(t=a(t))===t?t:0),r(a(e),t,n)}},1072:function(e,t){e.exports={downloadFile:function(e){var t=navigator.userAgent.toLowerCase().indexOf("chrome")>-1,n=navigator.userAgent.toLowerCase().indexOf("safari")>-1;if(/(iP)/g.test(navigator.userAgent))return alert("Your device does not support files downloading."),!1;if(t||n){var r=document.createElement("a");r.href=e,r.target="_blank";var a=e.substring(e.lastIndexOf("/")+1,e.length);if(r.download=a,console.log("link created is ",r),document.createEvent){var o=document.createEvent("MouseEvents");return o.initEvent("click",!0,!0),r.dispatchEvent(o),!0}}return-1===e.indexOf("?")&&(e+="?download"),window.open(e,"_self"),!0}}},902:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(913),a=n.n(r),o=n(0),s=n.n(o),i=n(55),l=n(44),u=n(223),c=(n.n(u),n(909),n(1072)),d=(n.n(c),n(381));function f(e){return(f="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function p(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function v(e,t){return!t||"object"!==f(t)&&"function"!==typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function m(e){return(m=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function h(e,t){return(h=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var y=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=v(this,m(t).call(this,e))).state={uploadProgress:0,popupNotificationShown:!1},n}var n,r,o;return function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&h(e,t)}(t,s.a.Component),n=t,(r=[{key:"componentWillMount",value:function(){var e=this.props,t=e.match,n=e.dispatch,r=t.params.id;n(d.a.fetchVideo({id:r})),this._startPoller()}},{key:"componentWillUnmount",value:function(){this._stopPoller()}},{key:"componentWillReceiveProps",value:function(e){var t=this,n=e.videoConvertProgress;n.video&&(["failed","uploaded"].indexOf(n.video.status)>-1&&this._sessionPoller&&this._stopPoller(),-1!==["failed","uploaded"].indexOf(n.video.status)||this._sessionPoller||this._startPoller(),n.video.autoDownload&&!this.state.popupNotificationShown&&(u.NotificationManager.info("Your browser might block download popup. you can enable popups from Videowiki by clicking on the block icon when it does or download the video manually from the history page","",15e3),this.setState({popupNotificationShown:!0})),"uploaded"===n.video.status&&("uploaded"!==this.props.videoConvertProgress.video.status&&n.video.autoDownload?(window.location.assign(n.video.url),this.setState({uploadProgress:100}),setTimeout(function(){t._navigateToHistory()},3e3)):(this.setState({uploadProgress:100}),this._navigateToHistory())))}},{key:"_startPoller",value:function(){var e=this.props,t=e.match,n=e.dispatch,r=t.params.id;this._sessionPoller||(this._sessionPoller=setInterval(function(){n(d.a.fetchVideo({id:r}))},1e4))}},{key:"_stopPoller",value:function(){this._sessionPoller&&(clearInterval(this._sessionPoller),this._sessionPoller=null)}},{key:"_navigateToHistory",value:function(){var e=this;setTimeout(function(){var t=e.props.videoConvertProgress.video,n=t.title,r=t.wikiSource;e.props.history.push("/videos/history/".concat(n,"?wikiSource=").concat(r))},2e3)}},{key:"_render",value:function(){var e=this.props.videoConvertProgress;if(!e.video)return s.a.createElement("div",null,"loading...");var t=e.video?e.video.title:"",n=e.video?e.video.status:"",r=e.video?Math.floor(e.video.conversionProgress):0;return s.a.createElement("div",{className:"u-page-center"},t&&"failed"!==n&&s.a.createElement("h2",null,"Exporting Videowiki Article for ".concat(t.split("_").join(" ")," to Video")),"failed"===n&&s.a.createElement("h2",null,"Something went wrong while exporting the article. please try again",s.a.createElement("br",null),s.a.createElement("br",null),s.a.createElement(l.b,{to:"/videowiki/".concat(e.video.title,"?wikiSource=").concat(e.video.wikiSource)},"Back to article")),"failed"!==n&&s.a.createElement(a.a,{className:"c-app-conversion-progress",percent:r,progress:!0,indicating:!0}),s.a.createElement("div",null,"queued"===n&&s.a.createElement("span",null,"Your video is currently queued to be exported. please wait"),"progress"===n&&s.a.createElement("span",null,"Exporting - ".concat(r,"% exported")),"converted"===n&&s.a.createElement("span",null,"Exported Successfully! Uploading to Commons..."),"uploaded"===n&&s.a.createElement("span",null,"Uploaded Successfully!")),"converted"===n&&s.a.createElement("div",{style:{display:"flex",justifyContent:"center",marginTop:30}},s.a.createElement(a.a,{style:{width:500,marginLeft:"-1rem"},percent:this.state.uploadProgress,progress:!0,indicating:!0})),-1===["failed","converted","uploaded"].indexOf(n)&&s.a.createElement("div",null,s.a.createElement("strong",null,"Quick Fact: "),"It takes 8-10 minutes to export an article. So get some ",s.a.createElement("img",{className:"c-app-coffee",src:"https://s3.eu-central-1.amazonaws.com/vwpmedia/statics/coffee.png"})," ",s.a.createElement("img",{className:"c-app-coffee",src:"https://s3.eu-central-1.amazonaws.com/vwpmedia/statics/coffee.png"})," until then."))}},{key:"render",value:function(){return this._render()}}])&&p(n.prototype,r),o&&p(n,o),t}();t.default=Object(i.b)(function(e){var t=e.video;return Object.assign({},{videoConvertProgress:t.videoConvertProgress})})(y)},907:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=l(n(2)),a=l(n(19)),o=l(n(3)),s=(l(n(4)),l(n(0))),i=n(5);function l(e){return e&&e.__esModule?e:{default:e}}function u(e){var t=e.children,n=e.className,l=e.content,c=(0,o.default)("content",n),d=(0,i.getUnhandledProps)(u,e),f=(0,i.getElementType)(u,e);return s.default.createElement(f,(0,r.default)({},d,{className:c}),(0,a.default)(t)?l:t)}u.handledProps=["as","children","className","content"],u._meta={name:"MessageItem",parent:"Message",type:i.META.TYPES.COLLECTION},u.defaultProps={as:"li"},u.create=(0,i.createShorthandFactory)(u,function(e){return{content:e}}),t.default=u},908:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=g(n(2)),a=g(n(20)),o=g(n(21)),s=g(n(22)),i=g(n(23)),l=g(n(19)),u=(g(n(79)),g(n(3))),c=(g(n(4)),n(0)),d=g(c),f=n(5),p=g(n(101)),v=g(n(910)),m=g(n(911)),h=g(n(912)),y=g(n(907));function g(e){return e&&e.__esModule?e:{default:e}}var b=function(e){function t(){var e,n,r,o;(0,a.default)(this,t);for(var i=arguments.length,l=Array(i),u=0;u<i;u++)l[u]=arguments[u];return n=r=(0,s.default)(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(l))),r.handleDismiss=function(e){var t=r.props.onDismiss;t&&t(e,r.props)},o=n,(0,s.default)(r,o)}return(0,i.default)(t,e),(0,o.default)(t,[{key:"render",value:function(){var e=this.props,n=e.attached,a=e.children,o=e.className,s=e.color,i=e.compact,c=e.content,y=e.error,g=e.floating,b=e.header,_=e.hidden,P=e.icon,E=e.info,O=e.list,w=e.negative,M=e.onDismiss,S=e.positive,N=e.size,T=e.success,k=e.visible,C=e.warning,j=(0,u.default)("ui",s,N,(0,f.useKeyOnly)(i,"compact"),(0,f.useKeyOnly)(y,"error"),(0,f.useKeyOnly)(g,"floating"),(0,f.useKeyOnly)(_,"hidden"),(0,f.useKeyOnly)(P,"icon"),(0,f.useKeyOnly)(E,"info"),(0,f.useKeyOnly)(w,"negative"),(0,f.useKeyOnly)(S,"positive"),(0,f.useKeyOnly)(T,"success"),(0,f.useKeyOnly)(k,"visible"),(0,f.useKeyOnly)(C,"warning"),(0,f.useKeyOrValueAndKey)(n,"attached"),"message",o),x=M&&d.default.createElement(p.default,{name:"close",onClick:this.handleDismiss}),K=(0,f.getUnhandledProps)(t,this.props),L=(0,f.getElementType)(t,this.props);return(0,l.default)(a)?d.default.createElement(L,(0,r.default)({},K,{className:j}),x,p.default.create(P),(!(0,l.default)(b)||!(0,l.default)(c)||!(0,l.default)(O))&&d.default.createElement(v.default,null,m.default.create(b),h.default.create(O),(0,f.createHTMLParagraph)(c))):d.default.createElement(L,(0,r.default)({},K,{className:j}),x,a)}}]),t}(c.Component);b._meta={name:"Message",type:f.META.TYPES.COLLECTION},b.Content=v.default,b.Header=m.default,b.List=h.default,b.Item=y.default,b.handledProps=["as","attached","children","className","color","compact","content","error","floating","header","hidden","icon","info","list","negative","onDismiss","positive","size","success","visible","warning"],t.default=b},909:function(e,t,n){"use strict";n.d(t,"a",function(){return p});var r=n(908),a=n.n(r),o=n(0),s=n.n(o),i=n(378);function l(e){return(l="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function u(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function c(e,t){return!t||"object"!==l(t)&&"function"!==typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function d(e){return(d=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function f(e,t){return(f=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var p=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),c(this,d(t).apply(this,arguments))}var n,r,l;return function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&f(e,t)}(t,o["Component"]),n=t,(r=[{key:"render",value:function(){var e=this.props,t=e.componentState,n=e.loaderMessage,r=e.errorMessage,o=e.onRender;switch(t){case"done":return o();case"loading":return this.props.loaderDisabled?null:s.a.createElement(i.a,{loaderImage:this.props.loaderImage},n);case"failed":return s.a.createElement(a.a,{color:"red",size:"massive"},r);default:return this.props.loaderDisabled?null:s.a.createElement(i.a,{loaderImage:this.props.loaderImage})}}}])&&u(n.prototype,r),l&&u(n,l),t}()},910:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=i(n(2)),a=i(n(3)),o=(i(n(4)),i(n(0))),s=n(5);function i(e){return e&&e.__esModule?e:{default:e}}function l(e){var t=e.children,n=e.className,i=(0,a.default)("content",n),u=(0,s.getUnhandledProps)(l,e),c=(0,s.getElementType)(l,e);return o.default.createElement(c,(0,r.default)({},u,{className:i}),t)}l.handledProps=["as","children","className"],l._meta={name:"MessageContent",parent:"Message",type:s.META.TYPES.COLLECTION},t.default=l},911:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=l(n(2)),a=l(n(19)),o=l(n(3)),s=(l(n(4)),l(n(0))),i=n(5);function l(e){return e&&e.__esModule?e:{default:e}}function u(e){var t=e.children,n=e.className,l=e.content,c=(0,o.default)("header",n),d=(0,i.getUnhandledProps)(u,e),f=(0,i.getElementType)(u,e);return s.default.createElement(f,(0,r.default)({},d,{className:c}),(0,a.default)(t)?l:t)}u.handledProps=["as","children","className","content"],u._meta={name:"MessageHeader",parent:"Message",type:i.META.TYPES.COLLECTION},u.create=(0,i.createShorthandFactory)(u,function(e){return{content:e}}),t.default=u},912:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=c(n(2)),a=c(n(100)),o=c(n(19)),s=c(n(3)),i=(c(n(4)),c(n(0))),l=n(5),u=c(n(907));function c(e){return e&&e.__esModule?e:{default:e}}function d(e){var t=e.children,n=e.className,c=e.items,f=(0,s.default)("list",n),p=(0,l.getUnhandledProps)(d,e),v=(0,l.getElementType)(d,e);return i.default.createElement(v,(0,r.default)({},p,{className:f}),(0,o.default)(t)?(0,a.default)(c,u.default.create):t)}d.handledProps=["as","children","className","items"],d._meta={name:"MessageList",parent:"Message",type:l.META.TYPES.COLLECTION},d.defaultProps={as:"ul"},d.create=(0,l.createShorthandFactory)(d,function(e){return{items:e}}),t.default=d},913:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=h(n(2)),a=h(n(20)),o=h(n(21)),s=h(n(22)),i=h(n(23)),l=h(n(19)),u=h(n(1067)),c=h(n(1069)),d=h(n(147)),f=(h(n(79)),h(n(3))),p=(h(n(4)),n(0)),v=h(p),m=n(5);function h(e){return e&&e.__esModule?e:{default:e}}var y=function(e){function t(){var e,n,r,o;(0,a.default)(this,t);for(var i=arguments.length,f=Array(i),p=0;p<i;p++)f[p]=arguments[p];return n=r=(0,s.default)(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(f))),r.calculatePercent=function(){var e=r.props,t=e.percent,n=e.total,a=e.value;return(0,d.default)(t)?(0,d.default)(n)||(0,d.default)(a)?void 0:a/n*100:t},r.getPercent=function(){var e=r.props.precision,t=(0,c.default)(r.calculatePercent(),0,100);return(0,d.default)(e)?t:(0,u.default)(t,e)},r.isAutoSuccess=function(){var e=r.props,t=e.autoSuccess,n=e.percent,a=e.total,o=e.value;return t&&(n>=100||o>=a)},r.renderLabel=function(){var e=r.props,t=e.children,n=e.label;return(0,l.default)(t)?(0,m.createHTMLDivision)(n,{defaultProps:{className:"label"}}):v.default.createElement("div",{className:"label"},t)},r.renderProgress=function(e){var t=r.props,n=t.precision,a=t.progress,o=t.total,s=t.value;if(a||!(0,d.default)(n))return v.default.createElement("div",{className:"progress"},"ratio"!==a?e+"%":s+"/"+o)},o=n,(0,s.default)(r,o)}return(0,i.default)(t,e),(0,o.default)(t,[{key:"render",value:function(){var e=this.props,n=e.active,a=e.attached,o=e.className,s=e.color,i=e.disabled,l=e.error,u=e.indicating,c=e.inverted,d=e.size,p=e.success,h=e.warning,y=(0,f.default)("ui",s,d,(0,m.useKeyOnly)(n||u,"active"),(0,m.useKeyOnly)(i,"disabled"),(0,m.useKeyOnly)(l,"error"),(0,m.useKeyOnly)(u,"indicating"),(0,m.useKeyOnly)(c,"inverted"),(0,m.useKeyOnly)(p||this.isAutoSuccess(),"success"),(0,m.useKeyOnly)(h,"warning"),(0,m.useValueAndKey)(a,"attached"),"progress",o),g=(0,m.getUnhandledProps)(t,this.props),b=(0,m.getElementType)(t,this.props),_=this.getPercent();return v.default.createElement(b,(0,r.default)({},g,{className:y,"data-percent":Math.floor(_)}),v.default.createElement("div",{className:"bar",style:{width:_+"%"}},this.renderProgress(_)),this.renderLabel())}}]),t}(p.Component);y._meta={name:"Progress",type:m.META.TYPES.MODULE},y.handledProps=["active","as","attached","autoSuccess","children","className","color","disabled","error","indicating","inverted","label","percent","precision","progress","size","success","total","value","warning"],t.default=y}});
//# sourceMappingURL=VideoConvertProgress.555ff291.chunk.js.map