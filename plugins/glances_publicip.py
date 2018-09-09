# -*- coding: utf-8 -*-
#
# This file is part of Glances.
#
# Copyright (C) 2018 Nicolargo <nicolas@nicolargo.com>
#
# Glances is free software; you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Glances is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.

"""foo plugin."""

from glances.plugins.glances_plugin import GlancesPlugin
import sys
import glances

import socket
from datetime import datetime
import urllib, json

class Plugin(GlancesPlugin):
    """Glances foo plugin.

    stats is a dict
    """

    def __init__(self, args=None):
        """Init the plugin."""
        super(Plugin, self).__init__(args=args)
        self.config=None
        # We want to display the stat in the curse interface
        self.display_curse = False

    @GlancesPlugin._check_decorator
    @GlancesPlugin._log_result_decorator
    def update(self):
        """Update swap memory stats using the input method."""
        self.stats = []
        if self.config is not None and self.config.has_section('publicip'):
            i=0
            while self.config.get_value('publicip', 'domain%s' % i, None) != None:
                domain = self.config.get_value('publicip', 'domain%s' % i)
                ip = "0.0.0.0"
                try:
                    if domain in ["local", "localhost", "127.0.0.1"]:
                        ip=json.loads(urllib.urlopen("http://ip.jsontest.com/").read())["ip"]
                    else:
                        ip=socket.gethostbyname(domain)
                except:
                    pass
                self.stats.append({"domain":domain, "ip":ip, "datetime":str(datetime.now())})
                i += 1
        return self.stats


    def load_limits(self, config):
        self.config = config
        super(Plugin, self).load_limits(config)

    def update_views(self):
        """Update stats views."""
        pass

    def msg_curse(self, args=None, max_width=None):
        """Return the dict to display in the curse interface."""
        return []

