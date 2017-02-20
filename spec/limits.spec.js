/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/12/17.
 */

'use strict';

describe('Fit', function(){

    let $input,
        plug;


    // Since I've got the problem with running tests both with karma and test runner,
    // due to the path and ajax loading of local files, I set the fixture as the string here.

    //jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';

    beforeEach(function () {
        setFixtures('<input id="dt" type="text" />');
        $input = $('#dt');
        $input.datetime({
            locale: 'ru',
            format:  'dd L yyyy HH:mm:ss',
            datetime: 1487136412359 // 15 февраля 2017 05:26:52
        });
        plug = $input.data().datetime;

    });

    it('validation date - in range', function(){

        const dt = new Date('01/02/2015 01:02:03 UTC');
        const options = {
            //minTime: 11 * 60 * 60 * 1000 + 45 * 60 * 1000,
            //maxTime: 17 * 60 * 60 * 1000 + 34 * 60 * 1000,
            minDate: new Date('01/01/2015 01:02:03 UTC'),
            maxDate: new Date('01/03/2015 01:02:03 UTC')

        };

        plug.setOptions( options ) ;
        const result = plug._validate(dt);
        expect( result ).toEqual( true );

    });

    it('validation date - date less than limit', function(){

        const dt = new Date('01/01/2015 00:00:00 UTC');
        const options = {
            //minTime: 11 * 60 * 60 * 1000 + 45 * 60 * 1000,
            //maxTime: 17 * 60 * 60 * 1000 + 34 * 60 * 1000,
            minDate: new Date('01/01/2015 01:02:03 UTC'),
            maxDate: new Date('01/03/2015 01:02:03 UTC')

        };

        plug.setOptions( options ) ;
        const result = plug._validate(dt);
        expect( result ).toEqual( false );

    });

    it('validation date - date bigger than limit', function(){

        const dt = new Date('01/05/2015 00:00:00 UTC');
        const options = {
            //minTime: 11 * 60 * 60 * 1000 + 45 * 60 * 1000,
            //maxTime: 17 * 60 * 60 * 1000 + 34 * 60 * 1000,
            minDate: new Date('01/01/2015 01:02:03 UTC'),
            maxDate: new Date('01/03/2015 01:02:03 UTC')

        };

        plug.setOptions( options ) ;
        const result = plug._validate(dt);
        expect( result ).toEqual( false );

    });

    it('validation date - date bigger than limit', function(){

        const dt = new Date('01/05/2015 00:00:00 UTC');
        const options = {
            minTime: new Date('01/01/2015 01:02:03 UTC'),
            maxTime: new Date('01/01/2015 01:02:03 UTC'),
            //minDate: new Date('01/01/2015 01:02:03 UTC'),
            //maxDate: new Date('01/03/2015 01:02:03 UTC')

        };

        plug.setOptions( options ) ;
        const result = plug._validate(dt);
        expect( result ).toEqual( false );

    });




    it('maxDate > input && input > minDate', function(){

        const dt = new Date('Thu Jan 01 1970 01:00:00 UTC');
        const options = {
            //minTime: 11 * 60 * 60 * 1000 + 45 * 60 * 1000,
            //maxTime: 17 * 60 * 60 * 1000 + 34 * 60 * 1000,
            minDate: new Date('Thu Jan 01 1970 00:00:00 UTC'),
            maxDate: new Date('Thu Jan 02 1970 00:00:00 UTC')

        };

        plug.setOptions( options ) ;
        const resultDT = plug._fitToLmits(dt);
        expect( resultDT ).toEqual( dt );

    });

    it('maxDate > input && minDate > input', function(){

        const dt = new Date('Jan 01 1969 02:00:00 UTC');
        const options = {
            //minTime: 11 * 60 * 60 * 1000 + 45 * 60 * 1000,
            //maxTime: 17 * 60 * 60 * 1000 + 34 * 60 * 1000,
            minDate: new Date('Thu Jan 01 1970 09:00:00 UTC'),
            maxDate: new Date('Thu Jan 02 1970 17:00:00 UTC')

        };

        plug.setOptions( options ) ;
        const resultDT = plug._fitToLmits(dt);
        expect( resultDT ).toEqual( options.minDate );

    });

    it('input > maxDate && input > minDate', function(){

        const dt = new Date('Jan 01 1989 02:00:00 UTC');
        const options = {
            //minTime: 11 * 60 * 60 * 1000 + 45 * 60 * 1000,
            //maxTime: 17 * 60 * 60 * 1000 + 34 * 60 * 1000,
            minDate: new Date('Thu Jan 01 1970 00:00:00 UTC'),
            maxDate: new Date('Thu Jan 02 1970 00:00:00 UTC')

        };

        plug.setOptions( options ) ;
        const resultDT = plug._fitToLmits(dt);
        expect( resultDT ).toEqual( options.maxDate );

    });

    it('Nightmare range valid time', function(){

        const dt = new Date('Jan 01 2017 02:00:00 UTC');
        const options = {
            minTime: new Date('Jan 01 2017 23:00:00 UTC'),
            maxTime: new Date('Jan 01 2017 03:00:00 UTC'),
            //minDate: new Date('Thu Jan 01 1970 00:00:00 UTC'),
            //maxDate: new Date('Thu Jan 02 1970 00:00:00 UTC')

        };

        plug.setOptions( options ) ;
        const resultDT = plug._fitToLmits(dt);
        expect( resultDT ).toEqual( dt );

    });

    it('Nightmare range invalid time', function(){

        const dt = new Date('Jan 01 2017 22:00:00 UTC');
        const options = {
            minTime: new Date('Jan 01 2017 23:00:00 UTC'),
            maxTime: new Date('Jan 01 2017 03:00:00 UTC'),
            //minDate: new Date('Thu Jan 01 1970 00:00:00 UTC'),
            //maxDate: new Date('Thu Jan 02 1970 00:00:00 UTC')

        };

        plug.setOptions( options ) ;
        const resultDT = plug._fitToLmits(dt);
        expect( resultDT ).toEqual( new Date('Jan 01 2017 00:00:00 UTC') );

    });



});