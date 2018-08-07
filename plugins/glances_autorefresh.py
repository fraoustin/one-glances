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
import random


import threading
import time
from datetime import datetime

import glances

API_VERSION = glances.__version__[0]

class loadRefresh(threading.Thread):
    def __init__(self, plugin):
        threading.Thread.__init__(self)
        self.plugin = plugin
        self.Terminated = False

    def run(self):
        while not self.Terminated:
            try:
                if glances.mode.__class__.__name__ == 'GlancesWebServer':
                    glances.mode.stats.update()
                    self.plugin.return_test({"refresh":str(datetime.now())})
                else:
                    self.plugin.return_test({"refresh":"0"})
            except:
                self.plugin.return_test({"refresh":"0"})
            time.sleep(10) #10s

    def stop(self):
        self.Terminated = True


# Define the history items list
# All items in this list will be historised if the --enable-history tag is set
items_history_list = [{'name': 'refresh',
                       'description': 'refresh',
                       'y_unit': ''}]

class Plugin(GlancesPlugin):
    """Glances foo plugin.

    stats is a dict
    """

    def __init__(self, args=None):
        """Init the plugin."""
        super(Plugin, self).__init__(args=args,
                                     items_history_list=items_history_list,
                                     stats_init_value={"refresh":"0"})
        # We want to display the stat in the curse interface
        self.display_curse = False
        
        t = loadRefresh(self)
        t.start()

    @GlancesPlugin._check_decorator
    @GlancesPlugin._log_result_decorator
    def update(self):
        """Update swap memory stats using the input method."""
        # Init new stats
        stats = self.get_init_value()
        if self.input_method == 'local':
            stats["refresh"] = self.test["refresh"]
        else:
            pass
        # Update the stats
        self.stats = stats

        return self.stats

    def update_views(self):
        """Update stats views."""
        pass

    def msg_curse(self, args=None, max_width=None):
        """Return the dict to display in the curse interface."""
        return []

    def return_test(self, value):
        self.test = value
