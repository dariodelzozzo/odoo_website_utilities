/*
* Copyright 2020 Dario Del Zozzo (www.ddzsoftware.com)
* MIT License.
*/
odoo.define('website_test_tutorial.test_website', function (require) {
    'use strict';

    // Core variables
    var ajax = require('web.ajax');
    var core = require('web.core');
    var _t = core._t;
    require('web.dom_ready');

    // Javascript module variables
    var caller = 'simple';

    // onClick Handler for button with class change-content
    $(document).on("click", "button.change-content", function (ev) {
        var post_values = {
            'call_type':  caller
        };

        ajax.jsonRpc("/test/url/json", "call", post_values)
            .then(function (response) {
               caller === 'simple' ? caller = 'models' : caller = 'simple';
                //TODO: Change the caller value for trigger the error!
                if (!('error' in response)){
                    $('.container-moduli').html(response.template)
                } else {
                    alert(response.error);
                }
            });
    });

    return "Try to use a require('website_test_tutorial.test_website') in another javascript module"
});
