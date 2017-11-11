/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/12/17.
 */

'use strict';

describe('DateTime suite', function(){

    let $input,
        plug;

    const format =  {
        hour12:  true,
        hour:    '2-digit',
        minute:  '2-digit',
        second:  '2-digit',
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric'
    };

    // Since I've got the problem with running tests both with karma and test runner,
    // due to the path and ajax loading of local files, I set the fixture as the string here.

    //jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';

    beforeEach(function () {
        setFixtures('<input id="dt" type="text" />');
        $input = $('#dt');
        $input.datetime({
            locale: 'ru',
            format:  format,
            minDate: new Date('01/05/2017 00:00:00 UTC'),
            maxDate: new Date('01/10/2017 00:00:00 UTC'),
            minTime: new Date('01/01/2017 09:00:00 UTC'),
            maxTime: new Date('01/01/2017 17:00:00 UTC')

        });
        plug = $input.data().datetime;

    });

    it('datetime - in range', function(){
        const dt = new Date('01/07/2017 11:02:03 UTC');
        const result = plug._validate(dt);
        expect( result ).toEqual( true );

    });

    it('datetime - out of time', function(){
        const dt = new Date('01/07/2015 01:02:03 UTC');
        const result = plug._validate(dt);
        expect( result ).toEqual( false );

    });

    it('datetime - out of time', function(){
        const dt = new Date('01/07/2018 18:02:03 UTC');
        const result = plug._validate(dt);
        expect( result ).toEqual( false );

    });

    it('datetime - in time, out of date', function(){
        const dt = new Date('01/01/2018 10:02:03 UTC');
        const result = plug._validate(dt);
        expect( result ).toEqual( false );

    });

    it('datetime - in time, out of date', function(){
        const dt = new Date('11/01/2018 10:02:03 UTC');
        const result = plug._validate(dt);
        expect( result ).toEqual( false );

    });

});