/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/12/17.
 */

'use strict';

describe('UI suite', function(){

    let $input,
        plug;

    //jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';

    beforeEach(function () {
        setFixtures('<input id="dt" type="text" />');
        $input = $('#dt');
        $input.datetime({
            locale: 'ru',
            format:  'dd L yyyy HH:mm:ss',
            minTime: new Date('01/01/2017 09:00:00 UTC'),
            maxTime: new Date('01/01/2017 17:00:00 UTC')

        });
        plug = $input.data().datetime;

    });

    it('12 a.m. means midnight', function(){
        const dt = new Date('01/05/2017 00:00:00 UTC');
        plug.setOptions({format: 'hh:mm a', locale: 'en' });
        plug.setTime(dt);
        const val = $input.val();
        expect(val).toEqual('12:00 AM');

    });


});