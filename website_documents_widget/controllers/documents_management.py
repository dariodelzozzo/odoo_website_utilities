# Copyright 2020 Dario Del Zozzo (www.ddzsoftware.com)
# MIT License.

import re
import base64
import werkzeug.utils
from json import dumps

from odoo import _
from odoo.http import request, route, Controller


class WebsiteDocumentWidget(Controller):

    def method(self):
        pass
