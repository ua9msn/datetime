/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/1/17.
 */

(function($, window, document, undefined){

    /* eslint-disable no-unused-vars */
    const KEY_TAB       = 9,
          KEY_ENTER     = 13,
          KEY_BACKSPACE = 8,
          KEY_DELETE    = 46,
          KEY_ESCAPE    = 27,
          KEY_SPACE     = 32,
          KEY_DOWN      = 40,
          KEY_UP        = 38,
          KEY_LEFT      = 37,
          KEY_RIGHT     = 39,
          KEY_A         = 65,
          KEY_C         = 67,
          KEY_V         = 86,
          KEY_D         = 68,
          KEY_F2        = 113,
          KEY_INSERT    = 45;
    /* eslint-enable no-unused-vars */

    const DAYLEN = 86400000;

    const hashTypeFn = {
        'weekday':   'Date',
        'month':     'Month',
        'day':       'Date',
        'year':      'FullYear',
        'hour':      'Hours',
        'minute':    'Minutes',
        'second':    'Seconds',
        'dayperiod': 'Hours'
    };

    const FORMAT = {
        hour12:  false,
        hour:    '2-digit',
        minute:  '2-digit',
        second:  '2-digit',
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric',
    };

    const pluginName   = 'datetime',
          defaultProps = {
              datetime: NaN,
              locale:   navigator.language,
              format:   FORMAT,
              useUTC:   true,
              minDate:  NaN,
              maxDate:  NaN,
              minTime:  NaN,
              maxTime:  NaN,
              onChange: t => {}
          };

    function Plugin(element, props){

        const _props = Object.assign({}, defaultProps, props);

        this.state = {
            type:     undefined,
            parts:    [],
            datetime: new Date(_props.datetime)
        };

        this.$element = element;
        this.element  = element[0];

        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleKeydown   = this._handleKeydown.bind(this);
        this._handleMousewheel = this._handleMousewheel.bind(this);

        this.element.setSelectionRange(0, 0);

        // this.element.addEventListener('select', this.handleSelection.bind(this));
        this.element.addEventListener('mouseup', this._handleMouseDown);
        this.element.addEventListener('keydown', this._handleKeydown);
        this.element.addEventListener('mousewheel', this._handleMousewheel);

        this.setOptions(_props);
    }

    Plugin.prototype = {

        setState: function(newPartialState, callback){

            this.state = Object.assign({}, this.state, newPartialState);

            this._render();

            if(callback) {
                callback.call(this);
            }

        },

        setOptions: function(props){

            this.props = Object.assign({}, this.props, props);

            const format = Object.assign( {}, this.props.format, {
                timeZone: this.props.useUTC ? 'Etc/UTC': undefined
            });

            this.dtFormatter = Intl.DateTimeFormat(this.props.locale, format);

            let mD = new Date(this.props.minDate).getTime();
            let MD = new Date(this.props.maxDate).getTime();
            let mT = new Date(this.props.minTime).getTime();
            let MT = new Date(this.props.maxTime).getTime();

            this.props.minTime = ( mT % DAYLEN + DAYLEN ) % DAYLEN; // NaN, number [0...86400000 - 1]
            this.props.maxTime = ( MT % DAYLEN + DAYLEN ) % DAYLEN;
            this.props.minDate = isNaN(mT) ? mD : mD - mD % DAYLEN;  // NaN, number
            this.props.maxDate = isNaN(MT) ? MD : MD - MD % DAYLEN;

            if(!isNaN(this.props.minTime)) {
                this.props.maxTime = isNaN(this.props.maxTime) ? DAYLEN : this.props.maxTime;
            }

            if(!isNaN(this.props.maxTime)) {
                this.props.minTime = isNaN(this.props.minTime) ? 0 : this.props.minTime;
            }

            const state = this._setDateTime( 'datetime' in props ? props.datetime : this.state.datetime );

            this.setState(state);


            this._render();

        },

        getTime: function(){
            return this.state.datetime;
        },

        setTime: function(date){
            const newState = this._setDateTime(date);
            this.setState(newState);
        },

        destroy(){

            this.element.removeEventListener('mouseup', this._handleMouseDown);
            this.element.removeEventListener('keydown', this._handleKeydown);
            this.element.removeEventListener('mousewheel', this._handleMousewheel);
            this.$element.off();
            this.$element.data(pluginName, null);
        },

        _render: function(){

            let string;

            try {
                string = this.dtFormatter.format(this.state.datetime);
            } catch(E) {
                string = '';
            }

            this.element.value = string;

            this.element.setSelectionRange(0, 0);

            const type = this.state.type || '';

            const partIndex = this.state.parts.findIndex(p => type ? p.type === type : p.type !== 'literal');

            if(!~partIndex) return;

            const ss = this.state.parts
                .slice(0, partIndex)
                .reduce((p, c) => p + c.value.length, 0);

            const se = ss + this.state.parts[partIndex].value.length;

            this.element.setSelectionRange(ss, se);
        },

        _setDateTime(datetime){

            let parts, type;

            datetime = new Date(datetime);

            datetime = this._fitToLimits(datetime);

            try {
                parts = this.dtFormatter.formatToParts(datetime);
                type  = this.state.type || parts.find(p => p.type !== 'literal').type;
            } catch(E) {
                parts = [];
                type  = undefined;
            }

            return({datetime, parts, type});

            // this.setState({
            //     type,
            //     datetime,
            //     parts,
            // }, () => {
            //     this.props.onChange(datetime);
            // });

        },

        _handleMouseDown(e){

            e.preventDefault();

            const parts = this.state.parts;
            let ss      = 0,
                  se    = 0,
                  cp    = e.target.selectionStart;

            const selection = parts.reduce((p, c) =>{
                ss = se;
                se = ss + c.value.length;

                if(c.type !== 'literal' && cp >= ss && cp <= se) {
                    p.type = c.type;
                    p.ss   = ss;
                    p.se   = se;
                }

                return p;

            }, {type: '', ss: 0, se: 0});

            this.state.type = selection.type;
            // this.state.ss = selection.ss ;
            // this.state.se = selection.se ;

            this._render();

        },

        _handleKeydown(e){

            switch(e.which) {

                case KEY_LEFT: {
                    e.preventDefault();
                    const type = this._getNextTypeInDirection(-1);
                    this.setState({type});
                    break;
                }

                case KEY_RIGHT: {
                    e.preventDefault();
                    const type = this._getNextTypeInDirection(1);
                    this.setState({type});
                    break;
                }

                case KEY_UP: {
                    e.preventDefault();
                    const newDatetime = this._crement(1, this.state.type);
                    const newState    = this._setDateTime(newDatetime);
                    this.setState(newState, this._notify);
                    break;
                }
                case KEY_DOWN: {
                    e.preventDefault();
                    const newDatetime = this._crement(-1, this.state.type);
                    const newState    = this._setDateTime(newDatetime);
                    this.setState(newState, this._notify);
                    break;
                }

                case KEY_DELETE: {
                    e.preventDefault();
                    const newState = this._setDateTime(new Date(NaN));
                    this.setState(newState, this._notify);

                    break;
                }

                case KEY_A:
                case KEY_C: {
                    if(!e.ctrlKey) {
                        e.preventDefault();
                    }
                    break;

                }

                default: {
                    // https://github.com/ua9msn/datetime/issues/2
                    e.preventDefault();
                    // ignore non-numbers
                    if(!isFinite(e.key)) return;
                    // ignore if nothing
                    if(!this.state.type) return;
                    // ignore ampm
                    if(this.state.type === 'dayperiod') return;
                    // ignore Weekday
                    if(this.state.type === 'weekday') return;

                    this._modify(+e.key, this.state.type);

                    break;

                }
            }

        },

        _handleMousewheel: function(e){
            e.preventDefault();
            e.stopPropagation();

            const direction = Math.sign(e.wheelDelta);

            const newDatetime = this._crement(direction, this.state.type);
            const newState    = this._setDateTime(newDatetime);
            this.setState(newState, this._notify);


            this._render();

        },

        _getNextTypeInDirection(direction){
            direction = Math.sign(direction);

            if(!this.state.parts || !this.state.parts.length) return;

            let curIndex = this.state.parts.findIndex(p => p.type === this.state.type);

            if(!~curIndex) {
                curIndex = this.state.parts.findIndex(p => p.type !== 'literal');
            }

            let ono = false, index = curIndex;

            while(!ono && this.state.parts[index + direction]) {
                index += direction;
                ono = this.state.parts[index] && this.state.parts[index].type !== 'literal';
            }

            return this.state.parts[ono ? index : curIndex].type;
        },

        _crement(operator, type){

            const part = this.state.parts.find(p => p.type === type);

            const dt = ( !isNaN(this.state.datetime) && this.state.datetime ) || this.props.preset || Date.now();

            const proxyTime = new Date(dt);

            if(!part || type === 'literal') return proxyTime;

            let fnName   = (this.props.useUTC ? 'UTC' : '' ) + hashTypeFn[type],
                newValue = proxyTime['get' + fnName]();

            if(part.type === 'dayperiod') {
                newValue += operator * 12;
            } else if(part.type === 'weekday') {
                newValue += operator;
            } else {
                newValue += operator;
            }

            proxyTime['set' + fnName](newValue);

            return this._fitToLimits(proxyTime);

        },

        _modify(input, type){

            const maxValue = this._getMaxFieldValueAtDate(this.state.datetime, type);

            const newDatetime = this._calculateNextValue(input, type, maxValue);

            const newState = this._setDateTime(newDatetime);

            this.setState(newState, this._notify);

            // if(result !== this.state.datetime) {
            //
            //     this.setState({
            //         datetime: result,
            //         spares : this._disassembleTimestamp(result, this.state.locale, this.state.format)
            //     }, this._notify)
            //
            // }
        },

        _getMaxFieldValueAtDate(date, fieldName){

            const fy = this.props.useUTC ? date.getUTCFullYear(): date.getFullYear();
            const m  = this.props.useUTC ? date.getUTCMonth()   : date.getMonth();

            switch(fieldName) {
                case 'year':
                    return 9999;
                case 'month':
                    return 12;
                case 'day':
                    return (new Date(fy, m + 1, 0)).getDate(); // get number of days in the month
                case 'hour':
                    return 23;
                case 'minute':
                    return 59;
                case 'second':
                    return 59;
                default:
                    break;

            }

        },

        _calculateNextValue(input, type, max){

            const getFN = 'get' + (this.props.useUTC ? 'UTC' : '' ) + hashTypeFn[type];
            const setFN = 'set' + (this.props.useUTC ? 'UTC' : '' ) + hashTypeFn[type];

            let prev = this.state.datetime[getFN]();

            // in spare month has value as for Date (Jan = 0)
            // but user input supposed to be 1 for Jan
            if(type === 'month') {
                prev = prev + 1;
            }

            //append number to the end
            const x = prev * 10 + input;

            // split to summ of digits
            const arr = [x % 10000, x % 1000, x % 100, x % 10];

            // calculate closest less value
            let mm = arr.reduce(function(p, c){
                return c <= max ? Math.max(p, c) : p;
            }, 0);

            // rollback month value
            // but prevent pass 0
            if(type === 'month') {
                mm = mm ? mm - 1 : prev - 1;
            }

            // Date can not be null.
            // We allow to enter 0 if it makes valid date (10, 20, 30)
            if(type === 'day' && mm === 0) {
                mm = prev;
            }

            let proxyTime = new Date(this.state.datetime);

            proxyTime[setFN](mm);

            const isValid = this._validate(proxyTime);

            if(isValid) {
                return proxyTime;
            } else {

                let isFieldValid        = true;
                const maxDateFieldValue = ( new Date(this.props.maxDate) )[getFN]();
                const minDateFieldValue = ( new Date(this.props.minDate) )[getFN]();
                const minTimeFieldValue = ( new Date(this.props.minTime) )[getFN]();  //NaN, number
                const maxTimeFieldValue = ( new Date(this.props.maxTime) )[getFN]();
                const thisValue         = proxyTime[getFN]();

                if(type === 'year' || type === 'month' || type === 'day') {
                    isFieldValid = !(maxDateFieldValue < thisValue) && !(thisValue < minDateFieldValue);
                }

                if(type === 'hour' || type === 'minute' || type === 'second') {

                    if(maxTimeFieldValue > minTimeFieldValue) {
                        isFieldValid = !( (maxDateFieldValue || maxTimeFieldValue) < thisValue) && !(thisValue < ( minTimeFieldValue || minDateFieldValue) );
                    } else {
                        isFieldValid = !( (maxDateFieldValue || maxTimeFieldValue) > thisValue) && !(thisValue > ( minTimeFieldValue || minDateFieldValue) );
                    }
                }

                if(isFieldValid) {
                    proxyTime = this._fitToLimits(proxyTime);
                    return proxyTime;
                }

                // spare.buffer = (spare.buffer || 0) * 10 + input;

                return this.state.datetime;

            }

        },

        _validate(datetime){

            const timestamp = datetime.getTime();
            const timePart  = (timestamp % DAYLEN + DAYLEN) % DAYLEN;
            const datePart  = timestamp - timePart;

            let validTime = true,
                validDate = true;

            const isMaxDate    = isFinite(this.props.maxDate);
            const isMaxTime    = isFinite(this.props.maxTime);
            const isMinDate    = isFinite(this.props.minDate);
            const isMinTime    = isFinite(this.props.minTime);
            const isNightRange = this.state.minTime > this.state.maxTime;

            if(isMinTime && isMaxTime) {
                validTime = isNightRange
                    ? this.props.maxTime >= timePart || timePart >= this.props.minTime
                    : this.props.maxTime >= timePart && timePart >= this.props.minTime;
            }

            if(isMinDate && !isMinTime) {
                validDate = validDate && (timestamp >= this.props.minDate);
            }

            if(isMaxDate && !isMaxTime) {
                validDate = validDate && (timestamp <= this.props.maxDate);
            }

            if(isMinDate && isMinTime) {
                validDate = validDate && (datePart >= this.props.minDate);
            }

            if(isMaxDate && isMaxTime) {
                validDate = validDate && (datePart <= this.props.maxDate);
            }

            return validDate && validTime;

        },

        _fitToLimits(datetime){

            if(isNaN(datetime)) return datetime;

            const timestamp = datetime.getTime();

            let timePart = (timestamp % DAYLEN + DAYLEN) % DAYLEN; //this is trick for negative timestamps
            let datePart = timestamp - timePart;

            if(!isNaN(this.props.minTime) && !isNaN(this.props.maxTime)) {

                if(this.props.maxTime > this.props.minTime) {
                    timePart = Math.max(this.props.minTime, Math.min(this.props.maxTime, timePart));
                } else {
                    let nearestLimit = Math.abs(timePart - this.props.maxTime) < Math.abs(timePart - this.props.minTime)
                        ? this.props.maxTime
                        : this.props.minTime;
                    timePart         = timePart > this.props.minTime || timePart < this.props.maxTime ? timePart : nearestLimit;
                }

                if(!isNaN(this.props.minDate)) {
                    datePart = Math.max(datePart, this.props.minDate);
                }

                if(!isNaN(this.props.maxDate)) {
                    datePart = Math.min(datePart, this.props.maxDate);
                }

            } else {

                timePart = 0;

                let mD = isNaN(this.props.minDate) ? -Infinity : this.props.minDate;
                let MD = isNaN(this.props.maxDate) ? Infinity : this.props.maxDate;

                datePart = Math.max(mD, Math.min(MD, timestamp));

                if(isNaN(datePart)) {
                    datePart = timestamp;
                }
            }

            return new Date(datePart + timePart);

        },

        _notify(){
            this.props.onChange(this.state.datetime);
            this.$element.trigger('change', this.state.datetime);
        }


    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function(method, options){

        /* eslint-disable no-console */
        if(!this.data(pluginName)) {

            if(typeof method === 'string') {
                console.warn('datetime plugin expect options object as first argument');
                return;
            }

            this.data(pluginName, new Plugin(this, method));

            return this;

        } else {
            //calling method
            let instance = this.data(pluginName);

            if(typeof instance[method] !== 'function') {
                console.warn('method ', method, ' not exist');
                return;
            }

            return instance[method](options);

        }
        /* eslint-enable no-console */

    };

})(jQuery, window, document);