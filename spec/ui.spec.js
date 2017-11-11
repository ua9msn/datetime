/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/12/17.
 */

'use strict';

describe('UI suite', function(){

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

    //jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';

    beforeEach(function () {
        setFixtures('<input id="dt" type="text" />');
        $input = $('#dt');
        $input.datetime({

            locale: 'en',
            format:  format
        });
        plug = $input.data().datetime;

    });

    it('12 a.m. means midnight', function(){
        const dt = new Date('01/05/2017 00:00:00 UTC');
        plug.setOptions({
            format:    {
                hour12: true,
                hour:   '2-digit',
                minute: '2-digit',
            }
        });
        plug.setTime(dt);
        const val = $input.val();
        expect(val).toEqual('12:00 AM');

    });


});