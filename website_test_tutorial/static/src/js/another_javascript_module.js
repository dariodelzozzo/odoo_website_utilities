/*
* Copyright 2020 Dario Del Zozzo (www.ddzsoftware.com)
* MIT License.
*/
odoo.define('website_test_tutorial.another_javascript_module', function (require) {
    'use strict';

    // Core variables
    var core = require('web.core');
    var _t = core._t;
    require('web.dom_ready');

    // Get variable, objects, class, widgets from another javascript module
    var variable_from_test_website = require('website_test_tutorial.test_website')

    // Now we can access this elem from variable_from_test_website!
});
