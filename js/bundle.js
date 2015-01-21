!function t(e,i,n){function s(o,a){if(!i[o]){if(!e[o]){var c="function"==typeof require&&require;if(!a&&c)return c(o,!0);if(r)return r(o,!0);var h=new Error("Cannot find module '"+o+"'");throw h.code="MODULE_NOT_FOUND",h}var u=i[o]={exports:{}};e[o][0].call(u.exports,function(t){var i=e[o][1][t];return s(i?i:t)},u,u.exports,t,e,i,n)}return i[o].exports}for(var r="function"==typeof require&&require,o=0;o<n.length;o++)s(n[o]);return s}({1:[function(t){function e(){g.dispatch("render")}var i=Object.create(t("./renderer/svg/face")),n=Object.create(t("./renderer/svg/pointControl")),s=Object.create(t("./renderer/svg/zoneEvent")),r=Object.create(t("./renderer/basicEvent")),o=Object.create(t("./renderer/timeLine/timeLine")),a=Object.create(t("./model/data/Face")),c=Object.create(t("./model/data/TimeLine")),h=Object.create(t("./model/app-state/Camera")),u=Object.create(t("./model/app-state/TimeLineState")),l=Object.create(t("./model/history")),d=Object.create(t("./controller/drawZone/dragPoint")),m=Object.create(t("./controller/drawZone/camera")),p=Object.create(t("./controller/timeLine/key")),f=Object.create(t("./controller/timeLine/cursor")),v=Object.create(t("./controller/ctrlZ")),y=Object.create(t("./staticController/applyTimeLine")),b=Object.create(t("./staticController/recompute")),g=t("./system/eventDispatcher");t("./layout"),t("./utils/doubleClick"),a.init(),h.init(),u.init(),c.init(),l.init();var k={face:a,camera:h,timeLineState:u,timeLine:c,history:l};window.modelBall=k;var x=document.querySelector(".app-draw-zone");i.init(k,x),n.init(k,x),s.init(k,x),r.init(k),o.init(k,document.querySelector(".app-timeLine")),d.init(k).enable(),m.init(k).enable(),p.init(k).enable(),v.init(k).enable(),f.init(k).enable(),y.init(k).enable(),b.init(k).enable(),a.chunk.mustach_left.line=[{x:50,y:20},{x:50,y:30},{x:70,y:20}],a.chunk.mustach_left.width=[40,20,35],a.chunk.mustach_left.recompute(),g.listen("please-render",e.bind(this),this),e();var L=function(){g.dispatch("please-render")};g.listen("change:shape",L),g.listen("change:camera",L);var w=function(t){t.wip||t.no_history||l.save(c)};l.save(c),g.listen("change:shape",w),g.listen("change:timeLine",w)},{"./controller/ctrlZ":2,"./controller/drawZone/camera":3,"./controller/drawZone/dragPoint":4,"./controller/timeLine/cursor":5,"./controller/timeLine/key":6,"./layout":7,"./model/app-state/Camera":8,"./model/app-state/TimeLineState":9,"./model/data/Face":10,"./model/data/TimeLine":13,"./model/history":14,"./renderer/basicEvent":16,"./renderer/svg/face":17,"./renderer/svg/pointControl":18,"./renderer/svg/zoneEvent":20,"./renderer/timeLine/timeLine":22,"./staticController/applyTimeLine":23,"./staticController/recompute":24,"./system/eventDispatcher":25,"./utils/doubleClick":30}],2:[function(t,e){var i=t("../utils/Abstract"),n=t("../system/eventDispatcher"),s=function(t){return this.model={history:t.history},this.keyDown=r.bind(this),this},r=function(t){if(t.mouseEvent.ctrlKey)switch(t.mouseEvent.which){case 90:n.dispatch(this.model.history.undo()!==!1?"history:undo":"history:nothing-to-undo");break;case 89:n.dispatch(this.model.history.redo()!==!1?"history:redo":"history:nothing-to-redo")}},o=function(){this.disable(),n.listen("ui-keydown",this.keyDown,this)},a=function(){n.unlisten("ui-keydown",this)};e.exports=Object.create(i).extend({init:s,enable:o,disable:a})},{"../system/eventDispatcher":25,"../utils/Abstract":28}],3:[function(t,e){var i=t("../../utils/Abstract"),n=t("../../system/eventDispatcher"),s=function(t){return this.model={camera:t.camera},this.mouseMove=h.bind(this),this.mouseUp=u.bind(this),this.mouseDown=c.bind(this),this.wheel=a.bind(this),this},r=function(){this.disable(),n.listen("ui-zone-mousedown",this.mouseDown,this),n.listen("ui-zone-wheel",this.wheel,this)},o=function(){n.unlisten("ui-tic-mousedown",this),n.unlisten("ui-zone-mousemove",this),n.unlisten("ui-mouseup",this)},a=function(t){this.model.camera.setZoom(this.model.camera.zoom+(t.mouseEvent.deltaY<0?1:-1),t.x,t.y)&&n.dispatch("change:camera",{wip:!1})},c=function(t){t.primaryTarget&&(this._origin={x:this.model.camera.origin.x,y:this.model.camera.origin.y},this._anchor={x:t.x,y:t.y},n.listen("ui-zone-mousemove",this.mouseMove,this),n.listen("ui-mouseup",this.mouseUp,this))},h=function(t){this.model.camera.origin.x=this._origin.x+(this._anchor.x-t.x)/this.model.camera._zoom,this.model.camera.origin.y=this._origin.y+(this._anchor.y-t.y)/this.model.camera._zoom,n.dispatch("change:camera",{wip:!0})},u=function(){n.dispatch("change:camera",{wip:!1}),n.unlisten("ui-zone-mousemove",this),n.unlisten("ui-mouseup",this)};e.exports=Object.create(i).extend({init:s,enable:r,disable:o})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28}],4:[function(t,e){var i=t("../../utils/Abstract"),n=t("../../system/eventDispatcher"),s=function(t){return this.model={face:t.face,camera:t.camera},this.ticDown=a.bind(this),this.ticMove=c.bind(this),this.ticUp=h.bind(this),this},r=function(){this.disable(),n.listen("ui-tic-mousedown",this.ticDown,this)},o=function(){n.unlisten("ui-tic-mousedown",this),n.unlisten("ui-zone-mousemove",this),n.unlisten("ui-mouseup",this)},a=function(t){this._shape=this.model.face.chunk[t.chunk],this._point=this._shape[t.pool][t.i],this._origin={x:this._point.x,y:this._point.y},this._anchor={x:t.x,y:t.y},n.listen("ui-zone-mousemove",this.ticMove,this),n.listen("ui-mouseup",this.ticUp,this)},c=function(t){this._point.x=this._origin.x+(t.x-this._anchor.x)/this.model.camera._zoom,this._point.y=this._origin.y+(t.y-this._anchor.y)/this.model.camera._zoom,n.dispatch("change:point",{point:this._point,shape:this._shape,wip:!0})},h=function(){n.dispatch("change:point",{point:this._point,shape:this._shape,wip:!1}),n.unlisten("ui-zone-mousemove",this),n.unlisten("ui-mouseup",this)};e.exports=Object.create(i).extend({init:s,enable:r,disable:o})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28}],5:[function(t,e){var i=t("../../utils/Abstract"),n=t("../../system/eventDispatcher"),s=function(t){return this.model={timeLineState:t.timeLineState},this.CurDown=a.bind(this),this.CurMove=c.bind(this),this.CurUp=h.bind(this),this},r=function(){this.disable(),n.listen("ui-tlCursor-mousedown",this.CurDown,this)},o=function(){n.unlisten("ui-tlCursor-mousedown",this)},a=function(t){this._origin=this.model.timeLineState.project(t.date),this._anchor=t.mouseEvent.pageX,n.unlisten("ui-mousemove",this),n.unlisten("ui-mouseup",this),n.listen("ui-mousemove",this.CurMove,this),n.listen("ui-mouseup",this.CurUp,this)},c=function(t){var e=this.model.timeLineState,i=e.unproject(this._origin+t.mouseEvent.pageX-this._anchor);e.cursor=i,n.dispatch("change:timeLineState",{wip:!0})},h=function(){var t=this.model.timeLineState;t.cursor=t.quantify(t.cursor),n.unlisten("ui-mousemove",this),n.unlisten("ui-mouseup",this),n.dispatch("change:timeLineState",{wip:!1})};e.exports=Object.create(i).extend({init:s,enable:r,disable:o})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28}],6:[function(t,e){var i=t("../../utils/Abstract"),n=t("../../system/eventDispatcher"),s=function(t){return this.model={face:t.face,timeLine:t.timeLine,timeLineState:t.timeLineState},this.lineClick=a.bind(this),this.keyDown=c.bind(this),this.keyMove=h.bind(this),this.keyUp=u.bind(this),this},r=function(){this.disable(),n.listen("ui-tlLine-doubleclick",this.lineClick,this),n.listen("ui-tlKey-mousedown",this.keyDown,this)},o=function(){n.unlisten("ui-tlLine-doubleclick",this),n.unlisten("ui-tlKey-doubleclick",this)},a=function(t){var e=this.model.face.chunk[t.chunk],i=t.date,s=this.model.timeLineState;this.model.timeLine.addOrSetKey(t.chunk,s.quantify(i),e.pack()),n.dispatch("change:timeLine",{wip:!1})},c=function(t){this._chunk=t.chunk,this._origin=this.model.timeLineState.project(t.date),this.h=t.mouseEvent.pageY,this._anchor=t.mouseEvent.pageX,this._key=this.model.timeLine.keys[t.chunk][t.i],this._removed=!1,n.unlisten("ui-mousemove",this),n.unlisten("ui-mouseup",this),n.listen("ui-mousemove",this.keyMove,this),n.listen("ui-mouseup",this.keyUp,this)},h=function(t){var e=this.model.timeLineState;if(Math.abs(this.h-t.mouseEvent.pageY)>50)this._removed||(this.model.timeLine.removeKey(this._chunk,this._key),this._removed=!0,n.dispatch("change:timeLine",{wip:!0}));else{var i=e.unproject(this._origin+t.mouseEvent.pageX-this._anchor);this._removed?(this._key=this.model.timeLine.addOrSetKey(this._chunk,i,this._key.pack),this._removed=!1):this.model.timeLine.setKeyDate(this._chunk,this._key,i),n.dispatch("change:timeLine",{wip:!0})}},u=function(){n.unlisten("ui-mousemove",this),n.unlisten("ui-mouseup",this);var t=this.model.timeLineState;this.model.timeLine.setKeyDate(this._chunk,this._key,t.quantify(this._key.date)),n.dispatch("change:timeLine",{wip:!1})};e.exports=Object.create(i).extend({init:s,enable:r,disable:o})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28}],7:[function(){var t=function(t,e,i){if(t.scrollTo)return void t.scrollTo(e,i);if(null!==t.scrollLeft&&null!==t.scrollTop)return t.scrollLeft=e,void(t.scrollTop=i);if(null!==t.scrollX&&null!==t.scrollY)return t.scrollX=e,void(t.scrollY=i);throw"unable to scroll"},e=function(t){if(null!==t.scrollLeft&&null!==t.scrollTop)return{x:t.scrollLeft,y:t.scrollTop};if(null!==t.scrollX&&null!==t.scrollY)return{x:t.scrollX,y:t.scrollY};if(null!==t.pageXOffset&&null!==t.pageYOffset)return{x:t.pageXOffset,y:t.pageYOffset};throw"unable to scroll"},i=document.querySelector(".app-draw-zone"),n=document.querySelector(".app-timeLine"),s=document.querySelector(".page-app"),r=document.body,o={};o[0]=function(t,e){var o=30,a=180;e=Math.max(e,550);var c=Math.max(Math.min(.3*e,320),a),h=e-c-o;h>400&&(h*=.95),h>600&&(h=600);var u=(e-h-c)/4;i.style.top=u+"px",i.style.height=h+"px",n.style.top=3*u+h+"px",n.style.height=c+"px",s.style.height=e+"px";var l=.8*t;500>l&&(l=.95*t),l>1e3&&(l=1e3),i.style.left=n.style.left=(t-l)/2+"px",i.style.width=n.style.width=l+"px",r.className="js-deferred-layout"};var a=function(){o[0](document.body.offsetWidth,window.innerHeight)},c=0,h=function(){window.clearTimeout(c),c=window.setTimeout(a,200)};a(),window.addEventListener("resize",h,!1);var u=document.querySelector(".page-app"),l=!1,d=function(){var i=e(document.body).y;Math.abs(i-u.offsetTop)<180&&(l=!0,t(document.body,0,u.offsetTop))},m=!1,p=!1,f=0,v=function(){return l?void(l=!1):(window.clearTimeout(f),void(m?p=!0:(p=!1,f=window.setTimeout(d,550))))},y=function(t){"mouseup"==t.type?(p&&(p=!1,window.clearTimeout(f),f=window.setTimeout(d,550)),m=!1):"mousedown"==t.type&&1==t.which&&t.currentTarget==document&&(m=!0)};window.addEventListener("scroll",v,!1),window.addEventListener("resize",v,!1),document.addEventListener("mousedown",y,!1),document.addEventListener("mouseup",y,!1)},{}],8:[function(t,e){var i=t("../../utils/Abstract"),n=(t("../../system/eventDispatcher"),t("../../utils/point"),function(){return this.project=s.bind(this),this.unproject=r.bind(this),this.origin={x:0,y:0},this.zoom=2,this._zoom=a(this.zoom),this}),s=function(t){return{x:(t.x-this.origin.x)*this._zoom,y:(t.y-this.origin.y)*this._zoom}},r=function(t){return{x:t.x/this._zoom+this.origin.x,y:t.y/this._zoom+this.origin.y}},o=function(t,e,i){var n=5;if(t=Math.min(Math.max(0,+t),n),t==this.zoom)return!1;var s=this.unproject({x:+e,y:+i}),r=a(t);return this.origin.x=s.x-e/r,this.origin.y=s.y-i/r,this.zoom=t,this._zoom=r,!0},a=function(t){return 1<<t};e.exports=Object.create(i).extend({init:n,setZoom:o})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28,"../../utils/point":31}],9:[function(t,e){var i=t("../../utils/Abstract"),n=(t("../../system/eventDispatcher"),function(){return this.origin=0,this.zoom=30,this.cursor=0,this.project=s.bind(this),this.projectQ=r.bind(this),this.unproject=o.bind(this),this.quantify=a.bind(this),this}),s=function(t){return(t-this.origin)*this.zoom},r=function(t){return this.quantify(this.project(t))},o=function(t){return t/this.zoom+this.origin},a=function(t){return Math.round(t)};e.exports=Object.create(i).extend({init:n})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28}],10:[function(t,e){var i=t("../../utils/Abstract"),n=t("../mixin/historizable"),s=t("./Shape"),r=t("./Line"),o=function(){return this.chunk={mustach_left:Object.create(r).init(),mustach_right:Object.create(r).init(),beard_left:Object.create(s).init(),beard_right:Object.create(s).init(),beard_mid:Object.create(s).init()},this},a=function(){var t={};for(var e in this.chunk)t[e]=this.chunck[e].pack();return t},c=function(t){for(var e in this.chunk)this.chunck[e].unpack(t[e]);return this};e.exports=Object.create(i).extend(n).extend({init:o,pack:a,unpack:c})},{"../../utils/Abstract":28,"../mixin/historizable":15,"./Line":11,"./Shape":12}],11:[function(t,e){var i=t("./Shape"),n=(t("../../system/eventDispatcher"),t("../../system/pathJob")),s=t("../../utils/point"),r=function(){return i.init.call(this),this.line=[],this.width=[],this},o=function(){return this.vertex=n.expandMustach(this.line,this.width),i.recompute.call(this)},a=function(){return{line:this.line.slice().map(s.copy),width:this.width.slice(),sharpness:this.sharpness.slice()}};e.exports=Object.create(i).extend({init:r,recompute:o,pack:a})},{"../../system/eventDispatcher":25,"../../system/pathJob":27,"../../utils/point":31,"./Shape":12}],12:[function(t,e){var i=t("../../utils/Abstract"),n=t("../mixin/historizable"),s=(t("../../system/eventDispatcher"),t("../../system/pathJob")),r=t("../../utils/point"),o=function(){return this.vertex=[],this.sharpness=[],this.bezierPath=[],this},a=function(){return this.bezierPath=s.bezify(this.vertex,.15),this},c=function(){return{vertex:this.vertex.slice().map(r.copy),sharpness:this.sharpness.slice()}};e.exports=Object.create(i).extend(n).extend({init:o,recompute:a,pack:c})},{"../../system/eventDispatcher":25,"../../system/pathJob":27,"../../utils/Abstract":28,"../../utils/point":31,"../mixin/historizable":15}],13:[function(t,e){var i=t("../../utils/Abstract"),n=t("../mixin/historizable"),s=(t("../../system/eventDispatcher"),function(){return this.keys={},this}),r=function(t,e){return t.date<e.date?-1:1},o=function(t,e,i){this.keys[t]||(this.keys[t]=[]);for(var n=this.keys[t].length;n--;)if(this.keys[t][n].date==e)return void(this.keys[t][n].pack=i);var s;return this.keys[t].push(s={date:e,pack:i}),this.keys[t].sort(r),s},a=function(t,e){var i;if(this.keys[t]&&!((i=this.keys[t].indexOf(e))<=-1))return this.keys[t].splice(i,1)[0]},c=function(t,e,i){return e.date=i,this.keys[t].sort(r),e};e.exports=Object.create(i).extend(n).extend({init:s,addOrSetKey:o,setKeyDate:c,removeKey:a})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28,"../mixin/historizable":15}],14:[function(t,e){var i=t("../utils/Abstract"),n=t("./mixin/historizable"),s=t("../system/eventDispatcher"),r=function(){return this.stack=[],this.undo_stack=[],this},o=function(t){for(this.stack.push({model:t,pack:t.pack()}),this.undo_stack.length=0;this.stack.length>50;)this.stack.shift()},a=function(){s.dispatch("change:timeLine",{no_history:!0})},c=function(t){if(this.stack.length<=1)return!1;var t=this.stack.pop(),e=this.stack[this.stack.length-1];t.model.unpack(n.deepCopy(e.pack)),a(t.model),this.undo_stack.push(t)},h=function(t){if(!this.undo_stack.length)return!1;var t=this.undo_stack.pop();t.model.unpack(n.deepCopy(t.pack)),this.stack.push(t),a(t.model)};e.exports=Object.create(i).extend(n).extend({init:r,undo:c,redo:h,save:o})},{"../system/eventDispatcher":25,"../utils/Abstract":28,"./mixin/historizable":15}],15:[function(t,e){var i=function(t){if("object"!=typeof t)return t;if(Array.isArray(t))return t.map(i);var e={};for(var n in t)"function"!=typeof t[n]&&(e[n]=i(t[n]));return e},n=function(t){for(var e in t)this[e]=i(t[e]);return this};e.exports={pack:function(){return i(this)},unpack:n,deepCopy:i}},{}],16:[function(t,e){var i=t("../utils/Abstract"),n=t("../system/eventDispatcher"),s=function(t){n.dispatch("ui-"+t.type,{mouseEvent:t})},r=function(){return document.addEventListener("mousedown",s,!1),document.addEventListener("mousemove",s,!1),document.addEventListener("mouseup",s,!1),document.addEventListener("keydown",s,!1),this};e.exports=Object.create(i).extend({init:r})},{"../system/eventDispatcher":25,"../utils/Abstract":28}],17:[function(t,e){var i=t("../../utils/Abstract"),n=t("../../system/eventDispatcher"),s=t("./svg-util"),r=function(){var t=this.model.face,e=this.model.camera,i=function(t){var i=e.project(t);return i.type=t.type,i};for(var n in t.chunk)t.chunk[n].recompute(),this.dom[n].setAttribute("d",s.renderBezier(t.chunk[n].bezierPath.map(i)))},o=function(t){var e=this.model.face;this.dom={};for(var i in e.chunk)this.dom[i]=s.create("path"),this.dom[i].setAttribute("class","hair-chunk "+i),t.appendChild(this.dom[i])},a=function(t,e){return this.model={face:t.face,camera:t.camera},o.call(this,e),n.listen("render",r.bind(this),this),this};e.exports=Object.create(i).extend({init:a,render:r})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28,"./svg-util":19}],18:[function(t,e){var i=t("../../utils/Abstract"),n=t("../../system/eventDispatcher"),s=t("./svg-util"),r=function(t,e){var i=s.create("circle");return i.setAttribute("cx",t),i.setAttribute("cy",e),i.setAttribute("r",5),i.setAttribute("class","control-tic"),i},o=function(){var t=this.model.face,e=this.model.camera.project;for(var i in t.chunk){var n=this.dom[i],s=t.chunk[i];n.innerHTML="";var o,a,c;s.line?(o=s.line,a="control-line",c="line"):(o=s.vertex,a="control-path",c="vertex"),o.map(e).forEach(function(t,e){var s=r(t.x,t.y);s.setAttribute("class","control-tic "+a),s.setAttribute("data-i",e),s.setAttribute("data-chunk",i),s.setAttribute("data-pool",c),n.appendChild(s)})}},a=function(t){var e=this.model.face;this.dom={};for(var i in e.chunk)this.dom[i]=s.create("g"),this.dom[i].className="control control-"+i,this.dom[i].setAttribute("data-chunk",i),t.appendChild(this.dom[i])},c=function(t,e){return this.model={face:t.face,camera:t.camera},a.call(this,e),n.listen("render",o.bind(this),this),this};e.exports=Object.create(i).extend({init:c,render:o})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28,"./svg-util":19}],19:[function(t,e){var i=function(t){return(0|100*t)/100},n=function(t){return i(t.x)+" "+i(t.y)},s=function(t){if(!t.length)return"";for(var e="M"+n(t[0]),i=1;i<t.length;i++)switch(t[i].type){case"F":e+="L"+n(t[i]);break;case"C":e+="Q"+n(t[i++])+" "+n(t[i])}return e+"z"},r=function(t,e){return"M"+t.reduce(function(t,e){return t+"L"+n(e)},"").slice(1)+(e?"z":"")},o="http://www.w3.org/2000/svg",a=function(t){return document.createElementNS(o,t)};e.exports={renderBezier:s,renderLine:r,create:a,svgNS:o}},{}],20:[function(t,e){var i=t("../../utils/Abstract"),n=t("../../system/eventDispatcher"),s=t("../../utils/domHelper"),r=function(t){if(1===t.which){var e=t.target.getAttribute("class").split(" "),i=s.offset(t.target),r=t.pageX-i.left,o=t.pageY-i.top,a=!0;e.indexOf("control-tic")>=0&&"wheel"!=t.type&&(n.dispatch("ui-tic-"+t.type,{mouseEvent:t,pool:t.target.getAttribute("data-pool"),chunk:t.target.getAttribute("data-chunk"),i:t.target.getAttribute("data-i"),x:r,y:o,primaryTarget:!0}),a=!1),n.dispatch("ui-zone-"+t.type,{mouseEvent:t,x:r,y:o,primaryTarget:a}),"wheel"==t.type&&(t.stopPropagation(),t.preventDefault())}},o=function(t,e){return e.addEventListener("mousedown",r,!1),e.addEventListener("mousemove",r,!1),e.addEventListener("mouseup",r,!1),e.addEventListener("wheel",r,!1),this.domSvg=e,this};e.exports=Object.create(i).extend({init:o})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28,"../../utils/domHelper":29}],21:[function(t,e){var i=t("../../utils/Abstract"),n=t("../../utils/domHelper"),s=t("../../system/eventDispatcher"),r=function(t){var e=n.offset(this.domEl).left,i=t.pageX;return this.model.timeLineState.unproject(i-e)},o=function(t){return s.dispatch("ui-tlCursor-"+t.type,{date:r.call(this,t),mouseEvent:t})},a=function(){var t=this.model.timeLineState;this.domCursor.style.left=t.project(t.cursor)-.5+"px"},c=['<div class="tl-ruler">','<div class="tl-cursor">',"</div>",'<div class="tl-ruler-grid"></div>',"</div>"].join(""),h=function(){this.domEl=n.domify(c),this.domCursor=this.domEl.querySelector(".tl-cursor")},u=function(t){return this.model={timeLineState:t.timeLineState},h.call(this),s.listen("change:timeLineState",a.bind(this),this),this.domEl.addEventListener("mousedown",o.bind(this),!1),this};e.exports=Object.create(i).extend({init:u,render:a})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28,"../../utils/domHelper":29}],22:[function(t,e){var i=t("../../utils/Abstract"),n=t("../../utils/domHelper"),s=t("../../system/eventDispatcher"),r=t("./ruler"),o=([].join(""),['<div class="tl-key">',"</div>"].join("")),a=['<div class="tl-row">','<svg class="tl-icon" viewBox="0 0 100 100"><path d="M50 0L93.3 25L93.3 75L50 100L6.7 75L6.7 25z"></path></svg>','<span class="tl-label"></span>','<div class="tl-toolBar"></div>',"</div>"].join(""),c=['<div class="tl-row">',"</div>"].join(""),h=['<div class="tl">','<div class="tl-left">','<div class="tl-global-label"></div>','<div class="tl-block-label"></div>',"</div>",'<div class="tl-right">','<div class="tl-block-lines"></div>',"</div>","</div>"].join(""),u=function(t){var e=n.offset(this.domEl.querySelector(".tl-block-lines")).left,i=t.pageX;return this.model.timeLineState.unproject(i-e)},l=function(t){if(!t.button){var e,i;return(e=n.getParent(t.target,"tl-key"))?s.dispatch("ui-tlKey-"+t.type,{mouseEvent:t,chunk:n.getParent(e,"tl-row").getAttribute("data-chunk"),i:e.getAttribute("data-i"),date:u.call(this,t)}):(i=n.getParent(t.target,"tl-row"))?s.dispatch("ui-tlLine-"+t.type,{mouseEvent:t,chunk:i.getAttribute("data-chunk"),date:u.call(this,t)}):void 0}},d=function(){var t=this.model.timeLine,e=this.model.timeLineState.project;for(var i in this.domLines){for(var s=this.domLines[i].children,r=s.length;r--;)s[r].remove();for(var r=(t.keys[i]||[]).length;r--;){var a=n.domify(o);a.setAttribute("data-i",r),a.style.left=e(t.keys[i][r].date)-5+"px",this.domLines[i].appendChild(a)}}},m=function(){var t=this.model.face;this.domEl=n.domify(h);var e=this.domEl.querySelector(".tl-block-label"),i=this.domEl.querySelector(".tl-block-lines");this.domEl.querySelector(".tl-right").insertBefore(this.ruler.domEl,i),this.domLines={};for(var s in t.chunk){var r=n.domify(a),o=n.domify(c);r.querySelector(".tl-label").innerHTML=s.replace("_"," "),o.setAttribute("data-chunk",s),e.appendChild(r),i.appendChild(o),this.domLines[s]=o}},p=function(t,e){this.model={face:t.face,timeLineState:t.timeLineState,timeLine:t.timeLine},this.ruler=Object.create(r).init(t),m.call(this),e.className+=" tl";for(var i=this.domEl.children.length;i--;)e.appendChild(this.domEl.children[i]);return this.domEl=e,s.listen("change:timeLine",d.bind(this),this),s.listen("render",d.bind(this),this),this.domEl.querySelector(".tl-block-lines").addEventListener("mousedown",l.bind(this),!1),this.domEl.querySelector(".tl-block-lines").addEventListener("doubleclick",l.bind(this),!1),this};e.exports=Object.create(i).extend({init:p,render:d})},{"../../system/eventDispatcher":25,"../../utils/Abstract":28,"../../utils/domHelper":29,"./ruler":21}],23:[function(t,e){var i=t("../utils/Abstract"),n=t("../system/eventDispatcher"),s=t("../system/interpolate"),r=function(t){return this.model={face:t.face,timeLine:t.timeLine,timeLineState:t.timeLineState},this.changeShape=c.bind(this),this.changeCursor=h.bind(this),this},o=function(){this.disable(),n.listen("change:shape",this.changeShape,this),n.listen("change:timeLineState",this.changeCursor,this)},a=function(){n.unlisten("change:shape",this),n.unlisten("change:timeLineState",this)},c=function(t){if(!t.wip&&!t.is_interpolation){for(var e in this.model.face.chunk)if(this.model.face.chunk[e]==t.shape)break;this.model.timeLine.addOrSetKey(e,this.model.timeLineState.cursor,t.shape.pack()),n.dispatch("change:timeLine",{wip:!1})}},h=function(t){var e=this.model.face.chunk,i=this.model.timeLineState.cursor,r=this.model.timeLine.keys;if(this._cursor!=i)for(var o in r){var a=r[o];if(i<=a[0].date)e[o].unpack(a[0].pack);else if(i>=a[a.length-1].date)e[o].unpack(a[a.length-1].pack);else{for(var c=1;c<a.length&&a[c].date<i;c++);var h=a[c-1],u=a[c],l=(i-h.date)/(u.date-h.date);e[o].unpack(s.lerpPack(h.pack,u.pack,l))}n.dispatch("change:point",{wip:t.wip,shape:e[o],is_interpolation:!0})}};e.exports=Object.create(i).extend({init:r,enable:o,disable:a})},{"../system/eventDispatcher":25,"../system/interpolate":26,"../utils/Abstract":28}],24:[function(t,e){var i=t("../utils/Abstract"),n=t("../system/eventDispatcher"),s=function(){return this.changePoint=a.bind(this),this},r=function(){this.disable(),n.listen("change:point",this.changePoint,this)},o=function(){n.unlisten("change:point",this)},a=function(t){t.shape.recompute(),n.dispatch("change:shape",{wip:t.wip,is_interpolation:t.is_interpolation,shape:t.shape})};e.exports=Object.create(i).extend({init:s,enable:r,disable:o})},{"../system/eventDispatcher":25,"../utils/Abstract":28}],25:[function(t,e){var i=t("../utils/Abstract"),n={},s=function(t,e){switch(t){case"ui-mousemove":break;default:console.log(t,e)}this._lock=!0;for(var i=n[t]||[],s=0;s<i.length;s++)i[s].fn(e,t);for(this._lock=!1;(this._stack||[]).length;){var r=this._stack.shift();this[r.fn].apply(this,r.args)}return this},r=function(t,e,i){return this._lock?void(this._stack=this._stack||[]).push({fn:"listen",args:arguments}):((n[t]=n[t]||[]).push({fn:e,key:i}),this)},o=function(t,e){if(this._lock)return void(this._stack=this._stack||[]).push({fn:"unlisten",args:arguments});for(var i=n[t]=n[t]||[],s=i.length;s--;)i[s].key==e&&i.splice(s,1);return this},a=function(t){return!!(n[t]||[]).length},c=function(){n={}};e.exports=Object.create(i).extend({dispatch:s,listen:r,unlisten:o,hasListener:a,reset:c})},{"../utils/Abstract":28}],26:[function(t,e){var i=t("../utils/point"),n=function(t,e,n){for(;t.length<e.length;)t.push(i.copy(e[e.length-1]));for(;e.length<t.length;)e.push(i.copy(t[t.length-1]));for(var s=[],r=0;r<t.length;r++)s.push(i.lerp(t[r],e[r],n));return s},s=function(t,e,n){for(;t.length<e.length;)t.push(i.copy(e[e.length-1]));for(;e.length<t.length;)e.push(i.copy(t[t.length-1]));for(var s=[],r=1-n,o=0;o<t.length;o++)s.push(r*t[o]+n*e[o]);return s},r=function(t,e,i){var r={};for(var o in t)switch(o){case"line":case"vertex":r[o]=n(t[o],e[o],i);break;case"width":r[o]=s(t[o],e[o],i)}return r};e.exports={lerpPack:r}},{"../utils/point":31}],27:[function(t,e){var i=t("../utils/point"),n=function(t){for(var e,i,n=t[0],s=t.length;s--;)e=n,n=t[s],(i=n.next+e.before>1)&&(n.next/=i,e.before/=i);return t},s=function(t,e){var s;if(t.length<2)return[];e&&"number"!=typeof e?n(e):s=e||.25;for(var r,o,a,c,h,u=t[0],l=t[1],d=[],m=t.length;m--;)r=l,l=u,u=t[m],h=s||e[m].before,c=s||e[m].after,o=i.lerp(l,u,h),a=i.lerp(l,r,c),o.type="F",a.type="F",l.type="C",d.push(a,l,o);return d},r=function(t,e){return t.reduce(function(n,s,r){if(0==r||r==t.length-1)return n.push(s),n;var o=i.normalize(i.diff(t[r-1],s)),a=i.normalize(i.diff(s,t[r+1])),c=o;c.x=a.x+o.x,c.y=a.y+o.y,i.normalize(c);var h=c.x;return c.x=c.y,c.y=-h,n.unshift({x:s.x+c.x*e[r],y:s.y+c.y*e[r]}),n.push({x:s.x-c.x*e[r],y:s.y-c.y*e[r]}),n},[])};e.exports={expandMustach:r,bezify:s}},{"../utils/point":31}],28:[function(t,e){e.exports={init:function(){return this},extend:function(t){for(var e in t)this[e]=t[e];return this}}},{}],29:[function(t,e){e.exports={hasClass:function(t,e){return t.classList.contains(e)},addClass:function(t,e){t.className+=" "+e},removeClass:function(t,e){for(var i="",n=t.classList.length;n--;)e!=t.classList[n]&&(i+=" "+t.classList[n]);t.className=i},getParent:function(t,e){for(;;){if(!t||this.hasClass(t,e))break;t=t.parentElement}return t},offset:function(t){for(var e={left:0,top:0};t&&null!==t.offsetLeft;)e.left+=t.offsetLeft,e.top+=t.offsetTop,t=t.parentElement;return e},bind:function(t,e,i){var n=e.split(" ");if(n.length>1)for(var s=n.length;s--;)this.bind(t,n[s],i);else t._bindHandlers=t._bindHandlers||{},this.unbind(t,e),t.addEventListener(e.split(".")[0],i,!1),t._bindHandlers[e]=i},unbind:function(t,e){var i=e.split(" ");if(i.length>1)for(var n=i.length;n--;)this.unbind(t,i[n]);else t._bindHandlers&&t._bindHandlers[e]&&(t.removeEventListener(e.split(".")[0],t._bindHandlers[e],!1),t._bindHandlers[e]=null)},domify:function(){if("object"!=typeof document)return function(){};var t=document.createElement("div");return function(e){t.innerHTML=e;var i=t.children[0];return t.innerHTML="",i}}()}},{}],30:[function(){!function(){var t,e,i={},n=0;document.addEventListener("mousedown",function(s){0==n||s.timeStamp-t>400?(t=s.timeStamp,e=s.target,i.x=s.pageX,i.y=s.pageY,n=1):n++}),document.addEventListener("mouseup",function(s){if(e!=s.target||s.timeStamp-t>400||Math.abs(i.x-s.pageX)>25||Math.abs(i.y-s.pageY)>25)return void(n=0);if(n>=2){var r=new MouseEvent("doubleclick",s);s.target.dispatchEvent(r),n=0}})}()},{}],31:[function(t,e){var i={};i.scalaire=function(t,e){return t.x*e.x+t.y*e.y},i.norme=function(t){return Math.sqrt(i.scalaire(t,t))},i.normalize=function(t){var e=i.norme(t);return t.x/=e,t.y/=e,t},i.diff=function(t,e){return{x:t.x-e.x,y:t.y-e.y}},i.lerp=function(t,e,i){var n=1-i;return{x:t.x*n+e.x*i,y:t.y*n+e.y*i}},i.copy=function(t){return{x:t.x,y:t.y}},e.exports=i},{}]},{},[1]);