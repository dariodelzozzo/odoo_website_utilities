# Copyright 2020 Dario Del Zozzo (www.ddzsoftware.com)
# MIT License.

{
    'name': 'Website Test Tutorial',
    'summary': "The standard boilerplate to build an Odoo website module.",
    'version': '12.0.1.0.0',
    'category': 'Tutorial',
    'website': 'https://www.ddzsoftware.com',
    'author': 'Dario Del Zozzo',
    'license': 'LGPL-3',
    'depends': [
        'portal',
        'web',
        'website',
        'sale',
        'sale_management',
    ],
    'data': [
        'views/assets.xml',
        'views/template_test.xml',
    ],
    # Toggle this if you need to test somethings!
    'installable': True
}
