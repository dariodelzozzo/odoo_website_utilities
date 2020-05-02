# Copyright 2020 Dario Del Zozzo (www.ddzsoftware.com)
# MIT License.

{
    'name': 'Website Document Widget',
    'description': """Website Document Widget.""",
    'summary': "Website Document Widget.",
    'version': '12.0.1.0.0',
    'category': 'Website',
    'website': 'http://www.openforce.it',
    'author': 'Dario Del Zozzo',
    'depends': [
        'portal',
        'web',
    ],
    'data': [
        'views/assets.xml',
        'views/attachment_view.xml',
        'views/document_management_views.xml',
        'views/portal_templates.xml',
        'security/ir.model.access.csv',
    ],
    'qweb': [
        'static/src/xml/portal_document_management.xml',
    ],
    'installable': True
}
