/**
 * Created by Michel Verbraak (info@1st-setup.nl).
 */

const openthermGatway = require('@1st-setup/openthermgateway');

module.exports = function (RED) {

	var self = this;

    function CUL_OTGW(config) {
		RED.nodes.createNode(this, config);
        this.name = config.name;
        this.serialDevice = config.serialdevice;
        this.debug = config.debug;
		var node = this;

        this.otgw = new openthermGatway("/dev/ttyUSB0",null, {debug:this.debug});

        this.output = function(out1, out2, out3, out4, out5) {
            node.send([
                out1,
                out2,
                out3,
                out4,
                out5
            ]);
        }

        this.otgw.on("error", (err) => {
            this.output({topic:"event", payload:{error:err.toString()}});
			node.status({
				fill: "red",
				shape: "dot",
				text: `Error`
			});
        });
        
        this.otgw.on("exception", (err) => {
            this.output({topic:"event", payload:{exception:err}});
			node.status({
				fill: "orange",
				shape: "dot",
				text: `Exception`
			});
        });
        
        // this.otgw.on("inError", (err) => {
        //     this.output({topic:"event", payload:{inError:err}});
		// 	node.status({
		// 		fill: "orange",
		// 		shape: "dot",
		// 		text: `InError`
		// 	});
        // });
        
        this.otgw.on("initialized",() => {
            this.output({topic:"event", payload:{status:"initialized"}});
			node.status({
				fill: "green",
				shape: "dot",
				text: `Initialized | Mode:${node.otgw.mode}`
			});
        })
        
        this.otgw.on("connected",() => {
            this.output({topic:"event", payload:{status:"initialized"}});
			node.status({
				fill: "yellow",
				shape: "dot",
				text: `Connected`
			});
        })

        this.otgw.on("printSummary",(data) => {
            this.output({topic:"printSummary", payload:data});
			node.status({
				fill: "green",
				shape: "dot",
				text: `printSummary | Mode:${node.otgw.mode}`
			});
        });

        this.otgw.on("otgwError",(data) => {
            this.output({topic:"otgwError", payload:data});
			node.status({
				fill: "orange",
				shape: "dot",
				text: `otgwError | Mode:${node.otgw.mode}`
			});
        });

        this.otgw.on("otgwData",(data) => {
            let out2, out3, out4, out5;

            try {
                if (data === undefined || !data.hasOwnProperty("decoded") || !data.decoded.hasOwnProperty("status")) {
                    return;
                }
            }
            catch(err) {
                return;
            }
            /*
                "R": "Gateway to boiler",
                "B": "From boiler",
                "T": "From thermostat",
                "A": "Gateway to thermostat"

            */
            switch (data.decoded.status) {
                case "R": out2 = {payload: data}; break;
                case "B": out3 = {payload: data}; break;
                case "T": out4 = {payload: data}; break;
                case "A": out5 = {payload: data}; break;
            }
            this.output(null, out2, out3, out4, out5);
			node.status({
				fill: "green",
				shape: "dot",
				text: `otgwData | Mode:${node.otgw.mode}`
			});
        })

 		/* ===== Node-Red events ===== */
		this.on("input", function (msg, send, done) {
			send = send || function() { node.send.apply(node,arguments) };

            switch (msg.topic) {
                case "cmd": {
                    node.otgw.sendCommand(msg.payload, (err, response) => {
                        send({topic:"cmd", payload:{err:err, cmd:msg.payload, response: response}});
                        node.status({
                            fill: "green",
                            shape: "dot",
                            text: `otgwResponse | Mode:${node.otgw.mode}`
                        });
                        if (done) {
                            done();
                        }
                    });
                    break;
                }
                case "data": {
                    send({topic:"data", data:node.otgw.data});
                    if (done) {
                        done();
                    }
                    break;
                }
                default:
                    if (done) {
                        done();
                    }
            }

        });

		this.on("close", function (removed, done) {
            node.otgw.close();
            if (done) {
                done();
            }    
		});

	}

	RED.nodes.registerType("otgw", CUL_OTGW);

}
