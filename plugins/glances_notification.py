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

from datetime import datetime

try:
    from urllib import urlencode, urlopen
    from urllib2 import URLError
except:
    from urllib.request import urlopen
    from urllib.parse import urlencode
    from urllib.error import URLError
import smtplib

url_smsapi_free = "https://smsapi.free-mobile.fr/sendmsg?"


def sms(user, key, msg):
    """ send sms to user by free mobile"""
    request = url_smsapi_free + urlencode({"user":user, "pass":key, "msg":' '.join(msg)})    
    try:
        response = urlopen(req)
        return "sms %s send" % user
    except URLError as e:
        if e.code == 400:
            return "missing parameter"
        elif e.code == 402:
            return "many sms"
        elif e.code == 403:
            return "function send sms not active for user"
        elif e.code == 500:
            return "error server"
        else:
            return "error with code %s" % e.code
    except Exception as e:
        return "Failed to reach a server\nReason: %s" % e.reason

def email(user, password, smtp, msg, subject):
    """ send mail to user by user"""
    try:
        server = smtplib.SMTP(smtp.split(":")[0], int(smtp.split(":")[1]))
        server.starttls()
        server.login(user,password)
        message = 'Subject: {}\n\n{}'.format(subject, msg)
        server.sendmail(user, user, message)
        server.quit()
        return "email %s send" % user
    except Exception as e:
        return "Error\nReason: %s" % str(e)

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
        self._old_status = []

    @GlancesPlugin._check_decorator
    @GlancesPlugin._log_result_decorator
    def update(self):
        """Update swap memory stats using the input method."""
        self.stats = []
        if self.config is not None and self.config.has_section('notification'):
            i=0
            while self.config.get_value('notification', 'test%s' % i, None) != None:
                if len(self._old_status) == i:
                    self._old_status.append(False)
                test = self.config.get_value('notification', 'test%s' % i, "1==1")
                title = self.config.get_value('notification', 'title%s' % i, "Without title")
                status = False
                result = ""
                try:
                    if glances.mode.__class__.__name__ == 'GlancesWebServer':
                        stat = glances.mode.stats.getAllAsDict()
                        status = eval(test)
                        if status != self._old_status[i]:
                            status_msg= "CRITICAL"
                            if status == False:
                                status_msg= "OK"

                            j=0
                            while self.config.get_value('notification', 'email%s-%s' % (i,j), None) != None:
                                user, password, smtp = self.config.get_value('notification', 'email%s-%s' % (i,j)).split(';')
                                msg = '%s %s' % (status_msg,title)
                                print(email(user, password, smtp, msg, title))
                                j=j+1
                            j=0
                            while self.config.get_value('notification', 'sms%s-%s' % (i,j), None) != None:
                                user, key = self.config.get_value('notification', 'sms%s-%s' % (i,j)).split(';')
                                msg = '%s %s' % (status_msg,title)
                                print(sms(user, key, msg))
                                j=j+1
                        self._old_status[i] = status
                    else:
                        pass
                except Exception as e:
                    result = str(e)
                self.stats.append({"title":title, "status":status, "datetime":str(datetime.now()), "result":result, "test":test})
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

