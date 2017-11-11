/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/12/17.
 */

'use strict';

describe('empty option suite', function(){

    var $input;

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
        $input.datetime();

    });



    it('$ should be defined', function(){
        expect($).not.toBeNull();
    });

    it('$input should be empty without any options', function(){
        expect($input.val()).toEqual('');
    });

    it('expect Invalid Date as result of getTime if input is empty', function(){
        expect($input.datetime('getTime').getTime()).toBeNaN();
    });

    it('setTime(0) must be 1 jan 1970 00:00:00', function(){

        $input.datetime('setTime', 0);
        let timestamp = $input.datetime('getTime').getTime();

        expect(timestamp).toEqual(0);

    });

    it('DEL should clear value and set Invalid Date', function(){
        $input.trigger({type: 'keypress', which: 46, keyCode: 46});
        let timestamp = $input.datetime('getTime').getTime();
        expect(timestamp).toBeNaN();
        expect($input.val()).toEqual('');

    });




});