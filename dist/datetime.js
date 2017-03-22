(function(a,b){if('function'==typeof define&&define.amd)define([],b);else if('undefined'!=typeof exports)b();else{b(),a.datetime={exports:{}}.exports}})(this,function(){'use strict';(function(a,b,d,f){function g(G,H){this.$element=G,this.element=G[0],this.currentSpareIndex=0,this.spares=[],this._handleMouseDown=this._handleMouseDown.bind(this),this._handleKeydown=this._handleKeydown.bind(this),this._handleMousewheel=this._handleMousewheel.bind(this),this._init(),this.setOptions(Object.assign({},F,H))}var D=8.64e7,E='datetime',F={datetime:NaN,locale:navigator.language,format:'dd.MM.yyyy HH:mm:ss',minDate:NaN,maxDate:NaN,minTime:NaN,maxTime:NaN,tabControls:!1};g.prototype={_init:function(){this.element.setSelectionRange(0,0),this.element.addEventListener('mouseup',this._handleMouseDown),this.element.addEventListener('keydown',this._handleKeydown),this.element.addEventListener('mousewheel',this._handleMousewheel)},_refresh:function(){this.spares=this._disassembleTimestamp(this.datetime,this.options.locale,this.options.format),this.element.value=this.spares.map(function(I){return I.strval}).join('');var H=this.spares[this.currentSpareIndex];H&&this.element.setSelectionRange(H.offset,H.offset+H.length)},_handleMouseDown:function(H){H.preventDefault(),H.stopPropagation(),this._ensureValueExist(),this.currentSpareIndex=this._calculateSpareIndexAtCaretPosition(H.target.selectionStart,this.spares);var I=this.spares[this.currentSpareIndex];H.target.focus();I&&H.target.setSelectionRange(I.offset,I.offset+I.length)},_ensureValueExist:function(){this.spares.length||(this.datetime=new Date,this._refresh())},_handleKeydown:function(H){var I=this;this._ensureValueExist();var J=this.spares[this.currentSpareIndex],K=-1,L=1,M=function move(N){I.currentSpareIndex=I._calculateNextSpareIndex(I.spares,I.currentSpareIndex,N,function(O){return'Delimiter'!==O.field}),I._refresh()};switch(H.which){case 37:H.preventDefault(),M(K);break;case 39:H.preventDefault(),M(L);break;case 38:H.preventDefault(),this._crement(1,J);break;case 40:H.preventDefault(),this._crement(-1,J);break;case 46:H.preventDefault(),this.datetime=new Date(NaN),this._refresh();break;case 9:if(this.options.tabControls){var N=this.currentSpareIndex;H.shiftKey?M(K):M(L),N!==this.currentSpareIndex&&H.preventDefault()}break;case 65:case 67:H.ctrlKey||H.preventDefault();break;default:if(!isFinite(H.key))return;if('AMPM'===J.field)return;if('Weekday'===J.field)return;this._modify(+H.key,J);}},_handleMousewheel:function(H){H.preventDefault(),H.stopPropagation(),this._ensureValueExist();var I=this.spares[this.currentSpareIndex],J=Math.sign(H.wheelDelta);this._crement(J,I),this._refresh()},_calculateSpareIndexAtCaretPosition:function(H,I){var J=0,K=I.findIndex(function(L){return'Delimiter'!==L.field});for(K;K<I.length&&('Delimiter'!==I[K].field&&(J=K),!(I[K].offset>=H));K++);return J},_calculateNextSpareIndex:function(H,I,J,K){J=Math.sign(J);var L=I;L/=1;for(var M=I+J;0<=M&&M<H.length;M+=J)if(K(H[M])){L=M;break}return L},_getMaxFieldValueAtDate:function(H,I){var J=H.getFullYear(),K=H.getMonth();switch(I){case'FullYear':return 9999;case'Month':return 12;case'Date':return new Date(J,K+1,0).getDate();case'Hours':return 23;case'Minutes':return 59;case'Seconds':return 59;default:}},_calculateNextValue:function(H,I,J){var K=I.buffer||I.value;'Month'===I.field&&++K;var L=10*K+H,N=[L%1e4,L%1e3,L%100,L%10].reduce(function(R,S){return S<=J?Math.max(R,S):R},0);'Month'===I.field&&(N=N?N-1:K-1),'Date'===I.field&&0===N&&(N=K);var O='setUTC'+I.field,P=new Date(this.datetime);P[O](N);var Q=this._validate(P);if(Q)return P;var R=!0,S=new Date(this.options.maxDate)['getUTC'+I.field](),T=new Date(this.options.minDate)['getUTC'+I.field](),U=new Date(this.options.minTime)['getUTC'+I.field](),V=new Date(this.options.maxTime)['getUTC'+I.field](),W=P['getUTC'+I.field]();return(('FullYear'===I.field||'Month'===I.field||'Date'===I.field)&&(R=!(S<W)&&!(W<T)),('Hours'===I.field||'Minutes'===I.field||'Seconds'===I.field)&&(V>U?R=!((S||V)<W)&&!(W<(U||T)):R=!((S||V)>W)&&!(W>(U||T))),R)?(P=this._fitToLmits(P),P):(I.buffer=10*(I.buffer||0)+H,this.datetime)},_crement:function(H,I){if('Delimiter'!==I.field){var J,K=I.value;'AMPM'===I.field?(J='setUTCHours',K+=12*H):'Weekday'===I.field?(J='setUTCDate',K+=H):(J='setUTC'+I.field,K+=H);var L=new Date(this.datetime);L[J](K);var M=this._fitToLmits(L);M.getTime()!==this.datetime.getTime()&&(this.datetime=M,this._refresh(),this.$element.trigger('change',this.datetime))}},_modify:function(H,I){var J=this._getMaxFieldValueAtDate(this.datetime,I.field),K=this._calculateNextValue(H,I,J);K!==this.datetime&&(this.datetime=K,this._refresh(),this.$element.trigger('change',this.datetime))},_disassembleTimestamp:function(H,I,J){var K=[],L=0;if('Invalid Date'==H)return K;if(H==f)return K;for(var M=J.trim().match(/\w+|\S|\s/g),N=H.getUTCDate(),O=H.getUTCFullYear(),P=H.getUTCHours(),Q=H.getUTCMinutes(),R=H.getUTCMonth(),S=H.getUTCSeconds(),T=H.getTime(),U=0;U<M.length;U++){var V={timeZone:'UTC'},W={},Y=void 0;switch(M[U]){case'yy':V.year='2-digit',W.strval=Intl.DateTimeFormat(I,V).format(T),W.value=O,W.field='FullYear';break;case'yyyy':V={year:'numeric',timeZone:'UTC'},W.strval=Intl.DateTimeFormat(I,V).format(T),W.value=O,W.field='FullYear';break;case'M':V.month='2-digit',W.strval=Intl.DateTimeFormat(I,V).format(T),W.value=R,W.field='Month';break;case'MM':V.month='short',W.strval=Intl.DateTimeFormat(I,V).format(T),W.value=R,W.field='Month';break;case'MMM':V.month='narrow',W.strval=Intl.DateTimeFormat(I,V).format(T),W.value=R,W.field='Month';break;case'MMMM':V.month='long',W.strval=Intl.DateTimeFormat(I,V).format(T),W.value=R,W.field='Month';break;case'L':V.month='long',V.day='2-digit',W.strval=Intl.DateTimeFormat(I,{day:'2-digit',month:'long'}).format(T).substr(3),W.value=R,W.field='Month';break;case'd':V.day='numeric',W.strval=Intl.DateTimeFormat(I,V).format(T),W.value=N,W.field='Date';break;case'dd':V.day='2-digit',W.strval=Intl.DateTimeFormat(I,V).format(T),W.value=N,W.field='Date';break;case'EE':V.weekday='short',W.strval=Intl.DateTimeFormat(I,V).format(T),W.value=N,W.field='Weekday';break;case'EEE':V.weekday='narrow',W.strval=Intl.DateTimeFormat(I,V).format(T),W.value=N,W.field='Weekday';break;case'EEEE':V.weekday='long',W.strval=Intl.DateTimeFormat(I,V).format(T),W.value=N,W.field='Weekday';break;case'h':W.strval=Intl.NumberFormat(I,{minimumIntegerDigits:1}).format(P%12),W.value=P,W.field='Hours';break;case'hh':W.strval=Intl.NumberFormat(I,{minimumIntegerDigits:2}).format(P%12),W.value=P,W.field='Hours';break;case'H':W.strval=Intl.NumberFormat(I,{minimumIntegerDigits:1}).format(P),W.value=P,W.field='Hours';break;case'HH':W.strval=Intl.NumberFormat(I,{minimumIntegerDigits:2}).format(P),W.value=P,W.field='Hours';break;case'm':W.strval=Intl.NumberFormat(I,{minimumIntegerDigits:1}).format(Q),W.value=Q,W.field='Minutes';break;case'mm':W.strval=Intl.NumberFormat(I,{minimumIntegerDigits:2}).format(Q),W.value=Q,W.field='Minutes';break;case's':W.strval=Intl.NumberFormat(I,{minimumIntegerDigits:1}).format(S),W.value=S,W.field='Seconds';break;case'ss':W.strval=Intl.NumberFormat(I,{minimumIntegerDigits:2}).format(S),W.value=S,W.field='Seconds';break;case'a':V.hour='numeric',V.hour12=!0,Y=Intl.DateTimeFormat(I+'-u-nu-latn',V).format(T),W.strval=Y.match(/[^\d\s]+/g)[0],W.value=P,W.field='AMPM';break;default:W.strval=M[U],W.field='Delimiter';}W.length=W.strval.length,W.offset=L,L+=W.length,K.push(W)}return K},_validate:function(H){var I=H.getTime(),J=(I%D+D)%D,K=I-J,L=!0,M=!0,N=isFinite(this.options.maxDate),O=isFinite(this.options.maxTime),P=isFinite(this.options.minDate),Q=isFinite(this.options.minTime),R=this.options.minTime>this.options.maxTime;return Q&&O&&(L=R?this.options.maxTime>=J||J>=this.options.minTime:this.options.maxTime>=J&&J>=this.options.minTime),P&&!Q&&(M=M&&I>=this.options.minDate),N&&!O&&(M=M&&I<=this.options.maxDate),P&&Q&&(M=M&&K>=this.options.minDate),N&&O&&(M=M&&K<=this.options.maxDate),M&&L},_fitToLmits:function(H){if(isNaN(H))return H;var I=H.getTime(),J=(I%D+D)%D,K=I-J;if(!isNaN(this.options.minTime)&&!isNaN(this.options.maxTime)){if(this.options.maxTime>this.options.minTime)J=Math.max(this.options.minTime,Math.min(this.options.maxTime,J));else{var L=Math.abs(J-this.options.maxTime)<Math.abs(J-this.options.minTime)?this.options.maxTime:this.options.minTime;J=J>this.options.minTime||J<this.options.maxTime?J:L}isNaN(this.options.minDate)||(K=Math.max(K,this.options.minDate)),isNaN(this.options.maxDate)||(K=Math.min(K,this.options.maxDate))}else{J=0;var L=isNaN(this.options.minDate)?-Infinity:this.options.minDate,M=isNaN(this.options.maxDate)?Infinity:this.options.maxDate;K=Math.max(L,Math.min(M,I)),isNaN(K)&&(K=I)}return new Date(K+J)},getTime:function(){return this.datetime},setTime:function(H){this.datetime=new Date(H),this._refresh()},setOptions:function(H){this.options=Object.assign({},this.options,H),this.datetime=H.hasOwnProperty('datetime')?new Date(H.datetime):this.datetime;var I=new Date(this.options.minDate).getTime(),J=new Date(this.options.maxDate).getTime(),K=new Date(this.options.minTime).getTime(),L=new Date(this.options.maxTime).getTime();this.options.minTime=(K%D+D)%D,this.options.maxTime=(L%D+D)%D,this.options.minDate=isNaN(K)?I:I-I%D,this.options.maxDate=isNaN(L)?J:J-J%D,isNaN(this.options.minTime)||(this.options.maxTime=isNaN(this.options.maxTime)?D:this.options.maxTime),isNaN(this.options.maxTime)||(this.options.minTime=isNaN(this.options.minTime)?0:this.options.minTime),this._refresh()},destroy:function(){this.element.removeEventListener('mouseup',this._handleMouseDown),this.element.removeEventListener('keydown',this._handleKeydown),this.element.removeEventListener('mousewheel',this._handleMousewheel),a(this.element).removeData(E)}},a.fn[E]=function(G,H){if(!this.data(E))return'string'==typeof G?void console.warn('datetime plugin expect options object as first argument'):(this.data(E,new g(this,G)),this);var I=this.data(E);return'function'==typeof I[G]?I[G](H):void console.warn('method ',G,' not exist')}})(jQuery,window,document)});
