Use this to connect to an [OpenTherm Gateway (OTGW)](http://otgw.tclcode.com/index.html)
==
**Configuration**

Specify a name an the serial device to which the OTGW is connected.

**Input**

Set topic to 'cmd' to send a command to the OTGW. The payload contains the OTGW command.

Set topic to 'data' to receive full set of latest data.

Results will the send to first output.


**Outputs**
* 1st output will contains results of input topics 'cmd' and 'data' and for events. The topic will tell what the payload is 'cmd', 'data' or 'event'.
* 2nd output will contain updates "Gateway to Boiler"  (status == "R")
* 3rd output will contain updates "From Boiler"  (status == "B")
* 4th output will contain updates "From thermostat"  (status == "T")
* 5th output will contain updates "Gateway to thermostat"  (status == "A")
