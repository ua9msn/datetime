/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/12/17.
 */

'use strict';

describe('Date suite', function(){

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
            minDate: new Date('01/01/2017 12:00:00 UTC'),
            maxDate: new Date('01/10/2017 00:00:00 UTC')

        });
        plug = $input.data().datetime;

    });

    it('date - in range', function(){
        const dt = new Date('01/05/2017 01:02:03 UTC');
        const result = plug._validate(dt);
        expect( result ).toEqual( true );

    });

    it('date - less than limits', function(){
        const dt = new Date('01/01/2015 01:02:03 UTC');
        const result = plug._validate(dt);
        expect( result ).toEqual( false );

    });

    it('date - bigger than limits', function(){
        const dt = new Date('01/01/2018 01:02:03 UTC');
        const result = plug._validate(dt);
        expect( result ).toEqual( false );

    });

});