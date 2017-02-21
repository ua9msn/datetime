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

    const pluginName = 'datetime',
        defaults   = {
            datetime: NaN,
            locale:   navigator.language,
            format:   'dd.MM.yyyy HH:mm:ss',
            minDate:  NaN,
            maxDate:  NaN,
            minTime:  NaN,
            maxTime:  NaN
        };

    function Plugin(element, options){
        this.$element          = element;
        this.element           = element[0];
        this.currentSpareIndex = 0;
        this.spares            = [];

        this._init();
        //clone value

        this.setOptions(Object.assign({}, defaults, options));
    }

    Plugin.prototype = {

        _init: function(){

            this.element.setSelectionRange(0, 0);

            // this.element.addEventListener('select', this.handleSelection.bind(this));
            this.element.addEventListener('mouseup', this._handleMouseDown.bind(this));
            this.element.addEventListener('keydown', this._handleKeydown.bind(this));
            this.element.addEventListener('mousewheel', this._handleMousewheel.bind(this));

        },

        _refresh: function(){
            this.spares        = this._disassembleTimestamp(this.datetime, this.options.locale, this.options.format);
            this.element.value = this.spares.map(s => s.strval).join('');

            const spare = this.spares[this.currentSpareIndex];
            if(spare) {
                this.element.setSelectionRange(spare.offset, spare.offset + spare.length);
            }
        },

        _handleMouseDown: function(e){

            e.preventDefault();
            e.stopPropagation();

            this.currentSpareIndex = this._calculateCurrentSpare(e.target.selectionStart, this.spares);
            const spare              = this.spares[this.currentSpareIndex];

            e.target.focus();

            if(!spare) return;

            e.target.setSelectionRange(spare.offset, spare.offset + spare.length);
        },

        _ensureValueExist: function(){
            if(!this.spares.length) {
                this.datetime = new Date();
                this._refresh();
            }

            return this.spares[this.currentSpareIndex];
        },

        _handleKeydown: function(e){
            e.stopPropagation();
            e.preventDefault();
            const spare = this._ensureValueExist();

            switch(e.which) {

            case KEY_LEFT:
                this.currentSpareIndex = this._calculateNextSpareIndex(this.spares, this.currentSpareIndex, -1, function(x){
                    return x.field !== 'Delimiter';
                });
                this._refresh();
                break;
            case KEY_RIGHT:
                this.currentSpareIndex = this._calculateNextSpareIndex(this.spares, this.currentSpareIndex, 1, function(x){
                    return x.field !== 'Delimiter';
                });
                this._refresh();
                break;

            case KEY_UP:
                this._crement(1, spare);
                break;
            case KEY_DOWN:
                this._crement(-1, spare);
                break;

            case KEY_DELETE:
                this.datetime = new Date(NaN);
                this._refresh();
                break;

            default:
                    // ignore non-numbers
                if(!isFinite(e.key)) return;
                    // ignore ampm
                if(spare.field === 'AMPM') return;
                    // ignore Weekday
                if(spare.field === 'Weekday') return;

                this._modify(+e.key, spare);
                break;

            }

        },

        _handleMousewheel: function(e){
            const direction = Math.sign(e.wheelDelta);

            const spare = this._ensureValueExist();

            this._crement(direction, spare);
            this._refresh();

        },

        _calculateCurrentSpare: function(caretPosition, spares){

            let l = 0,
                s = 0;

            for(s; s < spares.length - 1; s++) {

                l += spares[s].length;
                if(l >= caretPosition && spares[s].field !== 'Delimiter') {
                    break;
                }
            }
            return s;
        },

        _calculateNextSpareIndex: function(arr, currentIndex, direction, testFn){

            let y = currentIndex;

            do {
                direction > 0 ? y++ : y--;
            } while(arr[y] && !testFn(arr[y]));

            return Math.min(Math.max(0, y), arr.length - 1);

        },

        _getMaxFieldValueAtDate: function(date, fieldName){

            const fy = date.getFullYear();
            const m  = date.getMonth();

            switch(fieldName) {
            case 'FullYear':
                return 9999;
            case 'Month':
                return 12;
            case 'Date':
                return (new Date(fy, m + 1, 0)).getDate(); // get number of days in the month
            case 'Hours':
                return 23;
            case 'Minutes':
                return 59;
            case 'Seconds':
                return 59;
            default:
                break;

            }


        },

        _calculateNextValue: function(input, spare, max){

            let prev = spare.buffer || spare.value;

            // in spare month has value as for Date (Jan = 0)
            // but user input supposed to be 1 for Jan
            if(spare.field === 'Month') {
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
            if(spare.field === 'Month') {
                mm = mm ? mm - 1 : prev - 1;
            }

            // Date can not be null.
            // We allow to enter 0 if it makes valid date (10, 20, 30)
            if(spare.field === 'Date' && mm === 0) {
                mm = prev;
            }

            const fnName = 'setUTC' + spare.field;

            let proxyTime = new Date(this.datetime);

            proxyTime[fnName](mm);

            const isValid = this._validate(proxyTime);

            if(isValid) {
                return proxyTime;
            } else {

                let isFieldValid      = true;
                const maxDateFieldValue = ( new Date(this.options.maxDate) )['getUTC' + spare.field]();
                const minDateFieldValue = ( new Date(this.options.minDate) )['getUTC' + spare.field]();
                const minTimeFieldValue = ( new Date(this.options.minTime) )['getUTC' + spare.field]();  //NaN, number
                const maxTimeFieldValue = ( new Date(this.options.maxTime) )['getUTC' + spare.field]();
                const thisValue         = proxyTime['getUTC' + spare.field]();

                if(spare.field === 'FullYear' || spare.field === 'Month' || spare.field === 'Date') {
                    isFieldValid = !(maxDateFieldValue < thisValue) && !(thisValue < minDateFieldValue);
                }

                if(spare.field === 'Hours' || spare.field === 'Minutes' || spare.field === 'Seconds') {

                    if(maxTimeFieldValue > minTimeFieldValue) {
                        isFieldValid = !( (maxDateFieldValue || maxTimeFieldValue) < thisValue) && !(thisValue < ( minTimeFieldValue || minDateFieldValue) );
                    } else {
                        isFieldValid = !( (maxDateFieldValue || maxTimeFieldValue) > thisValue) && !(thisValue > ( minTimeFieldValue || minDateFieldValue) );
                    }
                }

                if(isFieldValid) {
                    proxyTime = this._fitToLmits(proxyTime);
                    return proxyTime;
                }

                spare.buffer = (spare.buffer || 0) * 10 + input;

                return this.datetime;

            }

        },

        _crement: function(operator, spare){

            if(spare.field === 'Delimiter') return;

            let fnName,
                newValue = spare.value;

            if(spare.field === 'AMPM') {
                fnName = 'setUTCHours';
                newValue += operator * 12;
            } else if(spare.field === 'Weekday') {
                fnName = 'setUTCDate';
                newValue += operator;
            } else {
                fnName = 'setUTC' + spare.field;
                newValue += operator;
            }

            const proxyTime = new Date(this.datetime);

            proxyTime[fnName](newValue);

            const result = this._fitToLmits(proxyTime);

            if(result.getTime() !== this.datetime.getTime()) {

                this.datetime = result;

                this._refresh();

                this.$element.trigger('change', this.datetime);
            }

        },

        _modify: function(input, spare){

            const maxValue = this._getMaxFieldValueAtDate(this.datetime, spare.field);

            const result = this._calculateNextValue(input, spare, maxValue);

            if(result !== this.datetime) {
                this.datetime = result;

                this._refresh();

                this.$element.trigger('change', this.datetime);

            }
        },

        /*
         * @param timestamp {int}
         * @return {string}
         * */
        _disassembleTimestamp: function(datetime, locale, format){

            let result = [],
                offset = 0;

            //NaN check
            if(datetime == 'Invalid Date') return result;

            // undefined and null check
            if(datetime == undefined) return result;

            const pattern = format.match(/\w+|\S|\s/g);

            const
                Date      = datetime.getUTCDate(),
                // Day          = datetime.getUTCDay(),
                FullYear  = datetime.getUTCFullYear(),
                Hours     = datetime.getUTCHours(),
                // Milliseconds = datetime.getUTCMilliseconds(),
                Minutes   = datetime.getUTCMinutes(),
                Month     = datetime.getUTCMonth(),
                Seconds   = datetime.getUTCSeconds(),
                timestamp = datetime.getTime();


            for(let i = 0; i < pattern.length; i++) {

                let intlOption = {timeZone: 'UTC'},
                    _spare     = {},
                    _l         = locale + '-u-nu-latn',
                    _p;

                switch(pattern[i]) {

                    /*
                     //era is not supported yet
                     case 'G':
                     intlOption  = {era: 'short', year: 'numeric', timeZone: 'UTC'};
                     _spare.strval = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                     _spare.value     = FullYear;
                     _spare.field = 'FullYear';

                     break;
                     */

                case 'yy' :
                    intlOption.year = '2-digit';
                    _spare.strval   = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                    _spare.value    = FullYear;
                    _spare.field    = 'FullYear';
                    break;

                case 'yyyy' :
                    intlOption    = {year: 'numeric', timeZone: 'UTC'};
                    _spare.strval = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                    _spare.value  = FullYear;
                    _spare.field  = 'FullYear';
                    break;

                case 'M' :
                    intlOption.month = '2-digit';
                    _spare.strval    = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                    _spare.value     = Month;
                    _spare.field     = 'Month';
                    break;

                case 'MM' :
                    intlOption.month = 'short';
                    _spare.strval    = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                    _spare.value     = Month;
                    _spare.field     = 'Month';
                    break;

                case 'MMM' :
                    intlOption.month = 'narrow';
                    _spare.strval    = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                    _spare.value     = Month;
                    _spare.field     = 'Month';
                    break;

                case 'MMMM' :
                    intlOption.month = 'long';
                    _spare.strval    = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                    _spare.value     = Month;
                    _spare.field     = 'Month';
                    break;

                case 'L' :
                    intlOption.month = 'long';
                    intlOption.day   = '2-digit';
                        // here we need the correct form of the month name
                    _spare.strval    = Intl.DateTimeFormat(locale, {
                        day:   '2-digit',
                        month: 'long'
                    }).format(timestamp).substr(3);
                    _spare.value     = Month;
                    _spare.field     = 'Month';
                    break;

                case 'd' :
                    intlOption.day = 'numeric';
                    _spare.strval  = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                    _spare.value   = Date;
                    _spare.field   = 'Date';
                    break;

                case 'dd' :
                    intlOption.day = '2-digit';
                    _spare.strval  = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                    _spare.value   = Date;
                    _spare.field   = 'Date';
                    break;

                case 'EE' :
                    intlOption.weekday = 'short';
                    _spare.strval      = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                    _spare.value       = Date;
                    _spare.field       = 'Weekday';
                    break;

                case 'EEE' :
                    intlOption.weekday = 'narrow';
                    _spare.strval      = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                    _spare.value       = Date;
                    _spare.field       = 'Weekday';
                    break;

                case 'EEEE' :
                    intlOption.weekday = 'long';
                    _spare.strval      = Intl.DateTimeFormat(locale, intlOption).format(timestamp);
                    _spare.value       = Date;
                    _spare.field       = 'Weekday';
                    break;


                case 'h':
                    _spare.strval = Intl.NumberFormat(locale, {minimumIntegerDigits: 1}).format(Hours % 12);
                    _spare.value  = Hours;
                    _spare.field  = 'Hours';
                    break;

                case 'hh':
                    _spare.strval = Intl.NumberFormat(locale, {minimumIntegerDigits: 2}).format(Hours % 12);
                    _spare.value  = Hours;
                    _spare.field  = 'Hours';
                    break;

                case 'H':
                    _spare.strval = Intl.NumberFormat(locale, {minimumIntegerDigits: 1}).format(Hours);
                    _spare.value  = Hours;
                    _spare.field  = 'Hours';
                    break;

                case 'HH':
                    _spare.strval = Intl.NumberFormat(locale, {minimumIntegerDigits: 2}).format(Hours);
                    _spare.value  = Hours;
                    _spare.field  = 'Hours';
                    break;

                case 'm' :
                    _spare.strval = Intl.NumberFormat(locale, {minimumIntegerDigits: 1}).format(Minutes);
                    _spare.value  = Minutes;
                    _spare.field  = 'Minutes';
                    break;

                case 'mm' :
                    _spare.strval = Intl.NumberFormat(locale, {minimumIntegerDigits: 2}).format(Minutes);
                    _spare.value  = Minutes;
                    _spare.field  = 'Minutes';
                    break;

                case 's' :
                    _spare.strval = Intl.NumberFormat(locale, {minimumIntegerDigits: 1}).format(Seconds);
                    _spare.value  = Seconds;
                    _spare.field  = 'Seconds';
                    break;

                case 'ss' :
                    _spare.strval = Intl.NumberFormat(locale, {minimumIntegerDigits: 2}).format(Seconds);
                    _spare.value  = Seconds;
                    _spare.field  = 'Seconds';
                    break;

                case 'a':

                        // very special case
                        // We do not know AMPM translation for unknown language.
                        // To detect we ask Intl to translate
                        // but Intl won't translate it without hours
                        // Due to non-latin numbers are treated by regexp as letters
                        // we force locale to use latin numbers and trim them out
                        // Wzhuh!


                    intlOption.hour   = 'numeric';
                    intlOption.hour12 = true;
                    _p                = Intl.DateTimeFormat(_l, intlOption).format(timestamp);

                    _spare.strval = _p.match(/[^\d\s]+/g)[0];
                    _spare.value  = Hours;
                    _spare.field  = 'AMPM';

                    break;

                    // delimeter
                default:
                    _spare.strval = pattern[i];
                    _spare.field  = 'Delimiter';
                    break;
                }

                _spare.length = _spare.strval.length;
                _spare.offset = offset;
                offset += _spare.length;
                result.push(_spare);

            }

            return result;
        },

        _validate: function(datetime){

            const timestamp = datetime.getTime();
            const timePart  = (timestamp % DAYLEN + DAYLEN) % DAYLEN;
            const datePart  = timestamp - timePart;

            let validTime = true,
                validDate = true;

            const isMaxDate = isFinite(this.options.maxDate);
            const isMaxTime = isFinite(this.options.maxTime);
            const isMinDate = isFinite(this.options.minDate);
            const isMinTime = isFinite(this.options.minTime);
            const isNightRange = this.options.minTime > this.options.maxTime;

            if(isMinTime && isMaxTime) {
                validTime = isNightRange
                    ? this.options.maxTime >= timePart || timePart >= this.options.minTime
                    : this.options.maxTime >= timePart && timePart >= this.options.minTime ;
            }

            if(isMinDate && !isMinTime) {
                validDate = validDate && (timestamp >= this.options.minDate);
            }

            if(isMaxDate && !isMaxTime) {
                validDate = validDate && (timestamp <= this.options.maxDate);
            }

            if(isMinDate && isMinTime) {
                validDate = validDate && (datePart >= this.options.minDate);
            }

            if(isMaxDate && isMaxTime) {
                validDate = validDate && (datePart <= this.options.maxDate);
            }

            return validDate && validTime;

        },

        _fitToLmits: function(datetime){

            if(isNaN(datetime)) return datetime;

            const timestamp = datetime.getTime();

            let timePart  = (timestamp % DAYLEN + DAYLEN) % DAYLEN, //this is trick for negative timestamps
                datePart  = timestamp - timePart;


            if(!isNaN(this.options.minTime) && !isNaN(this.options.maxTime)) {

                if(this.options.maxTime > this.options.minTime) {
                    timePart = Math.max(this.options.minTime, Math.min(this.options.maxTime, timePart));
                }  else {
                    let nearestLimit = Math.abs(timePart - this.options.maxTime) < Math.abs(timePart - this.options.minTime)
                        ? this.options.maxTime
                        : this.options.minTime;
                    timePart = timePart > this.options.minTime || timePart < this.options.maxTime ? timePart : nearestLimit;
                }

                if(!isNaN(this.options.minDate)){
                    datePart = Math.max(datePart, this.options.minDate);
                }

                if(!isNaN(this.options.maxDate)){
                    datePart = Math.min(datePart, this.options.maxDate);
                }


            } else {

                timePart = 0;

                let mD = isNaN(this.options.minDate) ? -Infinity : this.options.minDate;
                let MD = isNaN(this.options.maxDate) ?  Infinity : this.options.maxDate;

                datePart = Math.max(mD, Math.min(MD, timestamp) );

                if(isNaN(datePart)) {
                    datePart = timestamp;
                }
            }

            return new Date(datePart + timePart);

        },

        getTime: function(){
            return this.datetime;
        },

        setTime: function(date){

            this.datetime = new Date(date);
            this._refresh();
        },

        setOptions: function(options){

            this.options = Object.assign({}, this.options, options);

            this.datetime          = options.hasOwnProperty('datetime') ? new Date(options.datetime) : this.datetime;

            let mD = new Date(this.options.minDate).getTime();
            let MD = new Date(this.options.maxDate).getTime();
            let mT = new Date(this.options.minTime).getTime();
            let MT = new Date(this.options.maxTime).getTime();


            this.options.minTime = ( mT  % DAYLEN + DAYLEN ) % DAYLEN; // NaN, number [0...86400000 - 1]
            this.options.maxTime = ( MT  % DAYLEN + DAYLEN ) % DAYLEN;
            this.options.minDate = isNaN(mT) ? mD : mD - mD % DAYLEN;  // NaN, number
            this.options.maxDate = isNaN(MT) ? MD : MD - MD % DAYLEN;

            if(!isNaN(this.options.minTime)){
                this.options.maxTime = isNaN(this.options.maxTime) ? DAYLEN : this.options.maxTime;
            }

            if(!isNaN(this.options.maxTime)){
                this.options.minTime = isNaN(this.options.minTime) ? 0: this.options.minTime;
            }


            this._refresh();

        },

        destroy: function(){
            this.element.addEventListener('mouseup', this._handleMouseDown);
            this.element.addEventListener('keydown', this._handleKeydown);
            this.element.addEventListener('mousewheel', this._handleMousewheel);
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