/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/12/17.
 */

'use strict';

describe('Events suite', function(){

    let $input;

    const format =  {
        hour12:  false,
        hour:    '2-digit',
        minute:  '2-digit',
        second:  '2-digit',
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
            datetime: new Date(1487136412359) // 15 февраля 2017 05:26:52
        });

    });



    it('For 15 февраля 2017 05:26:52 click between ф and е should select 3, 10 ', function(){

        let plug = $input.data().datetime;

        let fakeEvent = {
            preventDefault: function(){},
            stopPropagation: function(){},
            target: $input[0]
        };

        $input[0].focus();

        $input[0].setSelectionRange(4,4);

        plug._handleMouseDown(fakeEvent);

        expect($input[0].selectionStart).toEqual(3);
        expect($input[0].selectionEnd).toEqual(10);


    });


    //  We can not trigger a real event via jasmine. so suppose it works without test :(
    // it('For CtrlA everything shoud be selected ', function(){
    // });



});