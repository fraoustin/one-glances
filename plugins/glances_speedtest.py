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

import threading
try:
    import speedtest
except:
    print("you have to install speedtest by pip install speedtest-cli")
    sys.exit(1)
import time
from datetime import datetime

class loadTest(threading.Thread):
    def __init__(self, plugin, default):
        threading.Thread.__init__(self)
        self.plugin = plugin
        self.default = default
        self.Terminated = False

    def run(self):
        while not self.Terminated:
            try:
                test = speedtest.Speedtest()
                test.get_best_server()
                test.download()
                test.upload()
                self.plugin.return_test({"client":test.config['client']['isp'], 
                    "ip":test.config['client']['ip'],
                    "distance":'%(d)0.2f' % test.results.server,
                    "upload":int(test.results.upload),
                    "download":int(test.results.download),
                    "datetime":str(datetime.now()) })
            except:
                self.plugin.return_test(self.default)
            time.sleep(60*15) #15min

    def stop(self):
        self.Terminated = True


# Define the history items list
# All items in this list will be historised if the --enable-history tag is set
items_history_list = [{'name': 'client',
                       'description': 'client',
                       'y_unit': ''},
                       {'name': 'ip',
                       'description': 'ip',
                       'y_unit': ''},
                       {'name': 'distance',
                       'description': 'distance',
                       'y_unit': 'km'},
                       {'name': 'upload',
                       'description': 'upload',
                       'y_unit': 'b/s'},
                       {'name': 'download',
                       'description': 'download',
                       'y_unit': 'b/s'},
                       {'name': 'datetime',
                       'description': 'datetime',
                       'y_unit': ''}]

class Plugin(GlancesPlugin):
    """Glances foo plugin.

    stats is a dict
    """

    def __init__(self, args=None):
        """Init the plugin."""
        super(Plugin, self).__init__(args=args,
                                     items_history_list=items_history_list,
                                     stats_init_value={"client":"", "ip":"", "distance":"", "upload":0, "download":0, "datetime":"?" })
        # We want to display the stat in the curse interface
        self.display_curse = False
        
        self.test = {"client":"?", "ip":"?", "distance":"0", "upload":0, "download":0, "datetime":"?" }
        t = loadTest(self, self.test)
        t.start()

    @GlancesPlugin._check_decorator
    @GlancesPlugin._log_result_decorator
    def update(self):
        """Update swap memory stats using the input method."""
        # Init new stats
        stats = self.get_init_value()
        if self.input_method == 'local':
            stats["client"] = self.test["client"]
            stats["ip"] = self.test["ip"]
            stats["datetime"] = self.test["datetime"]
            stats["distance"] = self.test["distance"]
            stats["upload"] = self.test["upload"]
            stats["download"] = self.test["download"]
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
